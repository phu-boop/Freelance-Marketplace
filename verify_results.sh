EMAIL="final_verify_$(date +%s)@example.com"
PASSWORD="Password123!"

echo "--- 1. Registering $EMAIL ---"
REG_RES=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"firstName\":\"Final\",\"lastName\":\"Verify\",\"roles\":[\"FREELANCER\"]}")
USER_ID=$(echo $REG_RES | jq -r '.id')
echo "User ID: $USER_ID"

echo "--- 2. Verifying Email ---"
ADMIN_TOKEN=$(curl -s -X POST http://172.22.0.1:8080/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=admin-cli&username=admin&password=admin" | jq -r '.access_token')

curl -s -X PUT http://172.22.0.1:8080/admin/realms/freelance-marketplace/users/$USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emailVerified": true}'

echo "--- 3. Logging In ---"
LOGIN_RES=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
TOKEN=$(echo $LOGIN_RES | jq -r '.access_token')

echo "--- 4. Updating Profile ---"
curl -s -X PATCH http://localhost:8000/api/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"primaryCategoryId":"cat_final_v4", "skills":["Expert","Verify"], "title":"Principal Verification Engineer"}'

echo "--- 5. Adding Experience ---"
curl -s -X POST http://localhost:8000/api/users/$USER_ID/experience \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company":"DeepMind", "title":"Agent Architect", "startDate":"2021-01-01T00:00:00.000Z"}'

echo "--- 6. Final Retrieval ---"
curl -s http://localhost:8000/api/users/$USER_ID -H "Authorization: Bearer $TOKEN" | jq '{id, email, primaryCategoryId, skills, title, experience}'
