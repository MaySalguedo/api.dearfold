\c joyfold;

CREATE OR REPLACE TRIGGER invoke_table_id_auth_credential BEFORE INSERT ON auth.credential

	FOR EACH ROW EXECUTE FUNCTION auth.credential_id();

CREATE OR REPLACE TRIGGER invoke_credential_bcrypt_password_hash BEFORE INSERT OR UPDATE OF password ON auth.credential

	FOR EACH ROW EXECUTE FUNCTION auth.credential_bcrypt_password_hash();

CREATE OR REPLACE TRIGGER invoke_update_updatedat_auth_credential BEFORE UPDATE ON auth.credential

	FOR EACH ROW EXECUTE FUNCTION auth.update_updatedat();