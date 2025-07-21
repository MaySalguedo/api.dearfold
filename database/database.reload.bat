@echo off
setlocal
set PGPASSWORD=
chcp 1252
psql -h localhost -U postgres -d postgres -c "DROP DATABASE joyfold;"
psql -h localhost -U postgres -d postgres -c "DROP ROLE joyfold;"
psql -h localhost -U postgres -d postgres --set=client_encoding=UTF8 -f "joyfold_environment_PostgresSQL.sql"
psql -h localhost -U postgres -d postgres --set=client_encoding=UTF8 -f "joyfold_data.sql"
pause