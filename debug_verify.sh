EMAIL="debug_$(date +%s)@example.com"
PASSWORD="Password123!"

echo "--- REGISTERING ---"
REG_RES=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"firstName\":\"Debug\",\"lastName\":\"User\",\"roles\":[\"FREELANCER\"]}")
echo "$REG_RES"
USER_ID=$(echo $REG_RES | jq -r '.id')

echo "--- VERIFYING EMAIL ---"
ADMIN_TOKEN=$(curl -s -X POST http://172.22.0.1:8080/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=admin-cli&username=admin&password=admin" | jq -r '.access_token')

curl -s -X PUT http://172.22.0.1:8080/admin/realms/freelance-marketplace/users/$USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emailVerified": true}'

echo "--- LOGGING IN ---"
LOGIN_RES=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$LOGIN_RES"
TOKEN=$(echo $LOGIN_RES | jq -r '.access_token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "--- DECODING TOKEN ---"
  echo "$TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq .
  
  echo "--- TESTING ME ENDPOINT ---"
  curl -s http://localhost:8000/api/users/me -H "Authorization: Bearer $TOKEN"
else
  echo "LOGIN FAILED: No token received."
fi
