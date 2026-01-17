#!/bin/bash

# Authenticate
docker exec -i freelance_keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin

# Create Realm
echo "Creating Realm..."
docker exec -i freelance_keycloak /opt/keycloak/bin/kcadm.sh create realms -s realm=freelance-marketplace -s enabled=true || echo "Realm might already exist"

# Create Services Client (Confidential)
echo "Creating Services Client..."
docker exec -i freelance_keycloak /opt/keycloak/bin/kcadm.sh create clients -r freelance-marketplace -s clientId=freelance-client -s enabled=true -s clientAuthenticatorType=client-secret -s secret=xwI5XqQWUNSJLtQ6g9IbSbJsjgK0U6M3 -s serviceAccountsEnabled=true -s directAccessGrantsEnabled=true -s standardFlowEnabled=true -s publicClient=false -s 'redirectUris=["*"]' -s 'webOrigins=["*"]' || echo "Client freelance-client might already exist"

# Create Frontend Client (Public)
echo "Creating Frontend Client..."
docker exec -i freelance_keycloak /opt/keycloak/bin/kcadm.sh create clients -r freelance-marketplace -s clientId=freelance-frontend -s enabled=true -s publicClient=true -s 'redirectUris=["*"]' -s 'webOrigins=["*"]' -s directAccessGrantsEnabled=true || echo "Client freelance-frontend might already exist"

# Create Roles
echo "Creating Roles..."
docker exec -i freelance_keycloak /opt/keycloak/bin/kcadm.sh create roles -r freelance-marketplace -s name=FREELANCER || echo "Role FREELANCER exists"
docker exec -i freelance_keycloak /opt/keycloak/bin/kcadm.sh create roles -r freelance-marketplace -s name=CLIENT || echo "Role CLIENT exists"
docker exec -i freelance_keycloak /opt/keycloak/bin/kcadm.sh create roles -r freelance-marketplace -s name=ADMIN || echo "Role ADMIN exists"

echo "Keycloak Initialization Complete"
