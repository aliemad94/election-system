-- Canonicalize bare Iraqi country-code numbers before phone constraints run.
UPDATE "Voter"
SET "phone" = '0' || substring(regexp_replace("phone", '[\s()-]', '', 'g') FROM 4)
WHERE regexp_replace("phone", '[\s()-]', '', 'g') LIKE '9647%';

UPDATE "ElectionKey"
SET "phone" = '0' || substring(regexp_replace("phone", '[\s()-]', '', 'g') FROM 4)
WHERE regexp_replace("phone", '[\s()-]', '', 'g') LIKE '9647%';

UPDATE "ElectionKey"
SET "phone2" = '0' || substring(regexp_replace("phone2", '[\s()-]', '', 'g') FROM 4)
WHERE regexp_replace("phone2", '[\s()-]', '', 'g') LIKE '9647%';

UPDATE "Tribe"
SET "leaderPhone" = '0' || substring(regexp_replace("leaderPhone", '[\s()-]', '', 'g') FROM 4)
WHERE regexp_replace("leaderPhone", '[\s()-]', '', 'g') LIKE '9647%';

UPDATE "Volunteer"
SET "phone" = '0' || substring(regexp_replace("phone", '[\s()-]', '', 'g') FROM 4)
WHERE regexp_replace("phone", '[\s()-]', '', 'g') LIKE '9647%';
