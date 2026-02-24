#!/bin/bash

# Configuration
KEYCLOAK_URL="http://localhost:8080"
REALM="freelance-marketplace"
KONG_CONFIG_FILE="./kong.yml"

echo "Fetching public key from Keycloak..."
PUBLIC_KEY_JSON=$(curl -s "${KEYCLOAK_URL}/realms/${REALM}")

if [ -z "$PUBLIC_KEY_JSON" ]; then
    echo "Error: Failed to fetch public key from Keycloak. Check if Keycloak is running."
    exit 1
fi

PUBLIC_KEY=$(echo $PUBLIC_KEY_JSON | grep -o '"public_key":"[^"]*"' | cut -d'"' -f4)

if [ -z "$PUBLIC_KEY" ]; then
    echo "Error: public_key not found in response."
    echo "Response: $PUBLIC_KEY_JSON"
    exit 1
fi

echo "Found public key: ${PUBLIC_KEY:0:20}..."

# Escape the public key for sed
ESCAPED_KEY=$(echo $PUBLIC_KEY | sed 's/[\/&]/\\&/g')

# Use python to update the yaml file as it is safer than sed for multiline indents
# Or we can just use a simple approach since we know the structure. 
# Let's try to find the rsa_public_key block and replace the key inside it.
# The previous manual update was careful.
# Let's assume the key is in the file and we want to update it.
# For simplicity in this environment, let's just use the current logic which is:
# We will use a temporary file to construct the new content if we had a robust YAML parser.
# Given tools availability usually includes python, let's try a python one-liner or just use sed if the format is strict.

# We know the format in kong.yml:
#         rsa_public_key: |
#           -----BEGIN PUBLIC KEY-----
#           <KEY_CONTENT>
#           -----END PUBLIC KEY-----

# We can replace the content between HEADER and FOOTER
# But wait, the key in kong.yml is split into multiple lines.
# The key we get from API is single line. It's fine for PEM to be single line?
# Usually PEM blocks are 64 char wrapped.
# Let's wrap the key.

WRAPPED_KEY=$(echo "$PUBLIC_KEY" | fold -w 64)

# Create a temporary file with the new key in PEM format
echo "          -----BEGIN PUBLIC KEY-----" > new_key.pem
while IFS= read -r line; do
    echo "          $line" >> new_key.pem
done <<< "$WRAPPED_KEY"
echo "          -----END PUBLIC KEY-----" >> new_key.pem

# Now we need to insert this into kong.yml
# This is tricky with sed/awk securely without destroying the file structure if we identify the block.
# Ideally we'd validly parse YAML.
# Since this is a dev script, let's print instructions or use a specialized tool if present.
# But I can write a small python script to do it if python3 is available.

echo "Authentication public key retrieved."
echo "Updating $KONG_CONFIG_FILE..."

python3 -c "
import sys

try:
    with open('$KONG_CONFIG_FILE', 'r') as f:
        lines = f.readlines()

    with open('new_key.pem', 'r') as f:
        new_key_lines = f.readlines()
        # Remove the first indent we added for creating the file, as we'll handle indent logic or just use what we have
        # actually the new_key.pem already has 10 spaces indent.
    
    # We want to replace the block following 'rsa_public_key: |'
    # until '-----END PUBLIC KEY-----'
    
    new_lines = []
    in_key_block = False
    skip = False
    
    for line in lines:
        if 'rsa_public_key: |' in line:
            new_lines.append(line)
            # Add our new key lines
            for k_line in new_key_lines:
                new_lines.append(k_line)
            in_key_block = True
            continue
            
        if in_key_block:
            if '-----END PUBLIC KEY-----' in line:
                in_key_block = False
                # We already added the end line via new_key.pem, so we skip this one from the old file
                continue
            # Skip old key lines
            continue
            
        new_lines.append(line)

    with open('$KONG_CONFIG_FILE', 'w') as f:
        f.writelines(new_lines)

    print('Successfully updated kong.yml')
except Exception as e:
    print(f'Error updating file: {e}')
    sys.exit(1)
"

# Cleanup
rm new_key.pem

echo "Reloading Kong..."
docker compose restart kong

echo "Done."
