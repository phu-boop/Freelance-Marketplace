#!/bin/bash
# Install jq if needed (assuming present or using Python)
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{"email": "testuser3@example.com", "password": "password123"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "Token captured."

echo "Fetching Proposals..."
PROPOSALS=$(curl -s -X GET http://localhost:8000/api/proposals/my -H "Authorization: Bearer $TOKEN")
echo $PROPOSALS | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))"

# Get first ID
FIRST_ID=$(echo $PROPOSALS | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id']) if len(data)>0 else print('')")

if [ -z "$FIRST_ID" ]; then
    echo "No proposals found. Creating one..."
    # Need a Job ID first. Assume one exists or fetch open jobs.
    # For now, just skip if no proposals.
    # Actually, let's list jobs to see if we can apply.
    JOBS=$(curl -s -X GET http://localhost:8000/api/jobs -H "Authorization: Bearer $TOKEN")
    JOB_ID=$(echo $JOBS | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['results'][0]['id']) if 'results' in data and len(data['results'])>0 else print('')")
    
    if [ ! -z "$JOB_ID" ]; then
        echo "Creating proposal for Job $JOB_ID..."
        curl -X POST http://localhost:8000/api/proposals -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"jobId\": \"$JOB_ID\", \"coverLetter\": \"Test proposal\", \"bidAmount\": 100, \"timeline\": \"1 week\"}"
        # Fetch again
        PROPOSALS=$(curl -s -X GET http://localhost:8000/api/proposals/my -H "Authorization: Bearer $TOKEN")
        FIRST_ID=$(echo $PROPOSALS | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id']) if len(data)>0 else print('')")
    fi
fi

if [ ! -z "$FIRST_ID" ]; then
    echo "Fetching Details for Proposal $FIRST_ID..."
    curl -v -X GET http://localhost:8000/api/proposals/$FIRST_ID -H "Authorization: Bearer $TOKEN"
else
    echo "Could not get a Proposal ID."
fi
