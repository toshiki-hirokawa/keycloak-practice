#!/bin/bash

COOKIE_JAR_PATH=/tmp/cookiejar

# ================================================================================
# Wait For Keycloak Start
# ================================================================================
KC_CONN_RETRY_MAX=400
SLEEP_TIME=5
TOTAL_SLEEP_TIME=5

while [[ "$(curl \
    -XGET -s \
    -c "${COOKIE_JAR_PATH}" \
    -b "${COOKIE_JAR_PATH}" \
    -o /dev/null \
    -w '%{http_code}\n' \
    "${KC_URI_BASE}/" \
)" != "200" ]] ; do
  if [[ $TOTAL_SLEEP_TIME -gt $KC_CONN_RETRY_MAX ]] ; then
    exit 1
  fi

  echo "[${TOTAL_SLEEP_TIME}/${KC_CONN_RETRY_MAX}] Wait ${SLEEP_TIME} seconds for connection to Keycloak. (Check to ${KC_URI_BASE}/)"
  sleep $SLEEP_TIME

  TOTAL_SLEEP_TIME=$(expr $TOTAL_SLEEP_TIME + 5)
done

# 起動直後にアクセスしてしまうとたまにトークン取得に失敗するため、数秒待機する
sleep 2

# ================================================================================
# Request Access Token
# ================================================================================
KC_ACCESS_TOKEN=$(curl \
  -XPOST -s \
  -c "${COOKIE_JAR_PATH}" \
  -b "${COOKIE_JAR_PATH}" \
  "${KC_URI_BASE}/realms/${KC_REALM_MASTER}/protocol/openid-connect/token" \
  -d "client_id=admin-cli" \
  -d "grant_type=password" \
  -d "username=${KEYCLOAK_ADMIN_USERNAME}" \
  -d "password=${KEYCLOAK_ADMIN_PASSWORD}" \
| jq -r ".access_token")

echo "
================================================================================
Requested Access Token
================================================================================
POST ${KC_URI_BASE}/realms/${KC_REALM_MASTER}/protocol/openid-connect/token
- client_id=admin-cli
- grant_type=password
- username=****
- password=****
"

# ================================================================================
# Update ClientSecret : sample-client
# ================================================================================
KC_CLIENT_ID__SAMPLE=$(curl \
  -XGET -s \
  -c "${COOKIE_JAR_PATH}" \
  -b "${COOKIE_JAR_PATH}" \
  -H "Content-Type: application/json" \
  -H "Authorization: bearer ${KC_ACCESS_TOKEN}" \
  "${KC_URI_BASE}/admin/realms/${KC_REALM_SERVICE}/clients?clientId=sample-client" \
| jq -r ".[0].id")

curl \
  -XPUT -s \
  -c "${COOKIE_JAR_PATH}" \
  -b "${COOKIE_JAR_PATH}" \
  -H "Content-Type: application/json" \
  -H "Authorization: bearer ${KC_ACCESS_TOKEN}" \
  "${KC_URI_BASE}/admin/realms/${KC_REALM_SERVICE}/clients/${KC_CLIENT_ID__SAMPLE}" \
  -d "{
    \"id\"     : \"${KC_CLIENT_ID__SAMPLE}\",
    \"secret\" : \"${KEYCLOAK_CLIENT_SAMPLE_SECRET}\"
  }"

echo "
================================================================================
Updated ClientSecret : sample-client
================================================================================
"

# ================================================================================
# Configured Users
# ================================================================================
curl \
  -XPOST -s \
  -c "${COOKIE_JAR_PATH}" \
  -b "${COOKIE_JAR_PATH}" \
  -H "Content-Type: application/json;charset=UTF-8" \
  -H "Authorization: bearer ${KC_ACCESS_TOKEN}" \
  "${KC_URI_BASE}/admin/realms/${KC_REALM_SERVICE}/users" \
  -d '{
    "username"      : "alice",
    "email"         : "alice@example.test",
    "enabled"       : true,
    "emailVerified" : true,
    "credentials" : [{
      "type"        : "password",
      "temporary"   : false,
      "value"       : "aaaaa11111"
    }]
  }'

curl \
  -XPOST -s \
  -c "${COOKIE_JAR_PATH}" \
  -b "${COOKIE_JAR_PATH}" \
  -H "Content-Type: application/json;charset=UTF-8" \
  -H "Authorization: bearer ${KC_ACCESS_TOKEN}" \
  "${KC_URI_BASE}/admin/realms/${KC_REALM_SERVICE}/users" \
  -d '{
    "username"      : "bob",
    "email"         : "bob@example.test",
    "enabled"       : true,
    "emailVerified" : true,
    "credentials" : [{
      "type"        : "password",
      "temporary"   : false,
      "value"       : "bbbbb22222"
    }]
  }'

echo "
================================================================================
Configured Users
================================================================================
alice: aaaaa11111
bob  : bbbbb22222

================================================================================
You can now start using Keycloak!
================================================================================
"
