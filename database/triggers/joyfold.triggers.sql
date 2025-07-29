\c joyfold;

CREATE OR REPLACE TRIGGER invoke_credential_id BEFORE INSERT ON auth.credential

	FOR EACH ROW EXECUTE FUNCTION auth.credential_id();

CREATE OR REPLACE TRIGGER invoke_token_id BEFORE INSERT ON auth.token

	FOR EACH ROW EXECUTE FUNCTION auth.token_id();

CREATE OR REPLACE TRIGGER invoke_credential_bcrypt_password_hash BEFORE INSERT OR UPDATE OF password ON auth.credential

	FOR EACH ROW EXECUTE FUNCTION auth.credential_bcrypt_password_hash();

CREATE OR REPLACE TRIGGER invoke_unique_token_uuid BEFORE INSERT ON auth.token

	FOR EACH ROW EXECUTE FUNCTION auth.unique_token_uuid();

CREATE OR REPLACE TRIGGER invoke_update_updatedat_auth_credential BEFORE UPDATE ON auth.credential

	FOR EACH ROW EXECUTE FUNCTION auth.update_updatedat();

CREATE OR REPLACE TRIGGER invoke_update_updatedat_auth_user BEFORE UPDATE ON auth.user

	FOR EACH ROW EXECUTE FUNCTION auth.update_updatedat();

CREATE OR REPLACE TRIGGER invoke_update_updatedat_auth_token BEFORE UPDATE ON auth.token

	FOR EACH ROW EXECUTE FUNCTION auth.update_updatedat();