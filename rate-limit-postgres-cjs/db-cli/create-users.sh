psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" $POSTGRES_DB <<-EOSQL
DO
'BEGIN
CREATE USER postgres WITH PASSWORD ''postgres'';
EXCEPTION WHEN duplicate_object THEN RAISE NOTICE ''%, skipping'', SQLERRM USING ERRCODE = SQLSTATE;
END';
EOSQL