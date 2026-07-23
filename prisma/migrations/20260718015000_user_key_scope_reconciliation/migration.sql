-- Legacy schemas allowed electionKeyId on every role. Non-KEY_USER links have
-- no authorization meaning in the hardened model, so detach them and revoke
-- existing sessions before User_key_scope_check is installed.
UPDATE "User"
SET
  "electionKeyId" = NULL,
  "tokenIssuedBefore" = CURRENT_TIMESTAMP
WHERE
  "electionKeyId" IS NOT NULL
  AND upper("role") <> 'KEY_USER';
