@echo off
setlocal
set PGPASSWORD=root
chcp 1252
psql -h localhost -U postgres -d postgres -c "DROP DATABASE dearfold;"
psql -h localhost -U postgres -d postgres -c "DROP ROLE dearfold;"
psql -h localhost -U postgres -d postgres --set=client_encoding=UTF8 -f "dearfold_environment_PostgresSQL.sql"
psql -h localhost -U postgres -d postgres --set=client_encoding=UTF8 -f "dearfold_data.sql"
pause