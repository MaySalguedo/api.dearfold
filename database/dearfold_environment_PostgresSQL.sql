CREATE DATABASE dearfold WITH ENCODING = 'UTF8' LC_COLLATE = 'es_ES.UTF-8'  LC_CTYPE = 'es_ES.UTF-8' TEMPLATE = template0;

CREATE ROLE dearfold WITH LOGIN PASSWORD 'lambda73';

ALTER DATABASE dearfold OWNER TO dearfold;

GRANT ALL PRIVILEGES ON DATABASE dearfold TO dearfold;

\c dearfold;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS dearfold AUTHORIZATION dearfold;
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION dearfold;

ALTER DEFAULT PRIVILEGES IN SCHEMA dearfold GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO dearfold;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO dearfold;

SET ROLE dearfold;

CREATE TABLE IF NOT EXISTS auth.credential(

	id VARCHAR(64),
	email VARCHAR(100) NOT NULL UNIQUE,
	password VARCHAR(60) NOT NULL,
	state BOOLEAN NOT NULL DEFAULT TRUE,
	createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)

);

CREATE TABLE IF NOT EXISTS auth.user(

	id VARCHAR(64),
	name VARCHAR(20) NOT NULL UNIQUE,
	picture VARCHAR(1000) NOT NULL DEFAULT 'https://avatars.githubusercontent.com/u/0?v=4',
	admin BOOLEAN DEFAULT FALSE,
	state BOOLEAN NOT NULL DEFAULT TRUE,
	createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)

);

CREATE TABLE IF NOT EXISTS auth.token(--refresh_token

	id VARCHAR(64),
	user_id VARCHAR(64) NOT NULL,
	uuid VARCHAR(36) DEFAULT NULL, --explorer id/session id
	state BOOLEAN NOT NULL DEFAULT TRUE,
	expiresat TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '2 months'),
	createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES auth.user(id) ON UPDATE CASCADE ON DELETE CASCADE

);

CREATE OR REPLACE FUNCTION auth.table_id() RETURNS TRIGGER AS $$

	BEGIN

		NEW.id = auth.id();
		RETURN NEW;

	END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auth.credential_id() RETURNS TRIGGER AS $$

	BEGIN

		NEW.id = auth.id(ARRAY[NEW.email]::VARCHAR[]);
		RETURN NEW;

	END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auth.token_id() RETURNS TRIGGER AS $$

	BEGIN

		NEW.id = auth.id(ARRAY[NEW.user_id]::VARCHAR[], 64, 64);
		RETURN NEW;

	END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auth.unique_token_uuid() RETURNS TRIGGER AS $$

	BEGIN

		IF NEW.uuid IS NOT NULL THEN

			UPDATE auth.token SET

				state = FALSE

			WHERE uuid = NEW.uuid;

		END IF;

		RETURN NEW;

	END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auth.credential_bcrypt_password_hash() RETURNS TRIGGER AS $$

	BEGIN

		NEW.password = auth.bcrypt_password_hash(NEW.password);
		RETURN NEW;

	END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auth.update_updatedat() RETURNS TRIGGER AS $$

	BEGIN

		NEW.updatedat = CURRENT_TIMESTAMP;
		RETURN NEW;

	END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auth.bcrypt_password_hash(plain_password VARCHAR) RETURNS VARCHAR AS $$

	BEGIN

		RETURN crypt(plain_password, gen_salt('bf', 12));

	END;

$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION auth.verify_password(plain_password VARCHAR, hashed_password VARCHAR) RETURNS BOOLEAN AS $$

	BEGIN

		RETURN hashed_password = crypt(plain_password, hashed_password);

	END;

$$ LANGUAGE plpgsql IMMUTABLE;

/*CREATE OR REPLACE FUNCTION auth.authorize(access_token_param VARCHAR) RETURNS BOOLEAN AS $$

	BEGIN

		RETURN EXISTS(

			SELECT t.id FROM

				auth.token AS t

			WHERE access_token = access_token_param AND t.state = TRUE

		);

	END;

$$ LANGUAGE plpgsql IMMUTABLE;*/

CREATE OR REPLACE FUNCTION auth.id(

	extra_params VARCHAR[] DEFAULT '{}',
	min_length INT DEFAULT 8, 
	max_length INT DEFAULT 64
	
) RETURNS VARCHAR AS $$

	DECLARE

		chars VARCHAR := '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
		epoch_ms BIGINT;
		param_str VARCHAR;
		hash_part VARCHAR;
		time_part VARCHAR;
		rand_part VARCHAR;
		id_length INT;
		rand_length INT;

	BEGIN

		id_length := min_length + FLOOR(RANDOM() * (max_length - min_length + 1))::INT;

		param_str := array_to_string(extra_params, '|');
		hash_part := SUBSTRING(MD5(param_str) FROM 1 FOR 4);

		epoch_ms := (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000)::BIGINT;
		time_part := '';

		FOR i IN 1..8 LOOP

			time_part := SUBSTRING(

				chars, ((epoch_ms >> ((8 - i) * 6)) & 63)::INT + 1, 1

			) || time_part;

		END LOOP;

		rand_length := GREATEST(id_length - 12, 0);
		rand_part := '';

		FOR i IN 1..rand_length LOOP

			rand_part := rand_part || SUBSTRING(chars, (random() * 64)::INT + 1, 1);

		END LOOP;

		RETURN SUBSTRING(time_part || hash_part || rand_part FROM 1 FOR id_length);

	END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auth.authenticate(email_param VARCHAR, password_param VARCHAR) RETURNS TABLE (

	id VARCHAR,
	name VARCHAR,
	picture VARCHAR,
	admin BOOLEAN,
	state BOOLEAN,
	"createdAt" TIMESTAMP,
	"updatedAt" TIMESTAMP

) AS $$

	BEGIN

		RETURN QUERY

		SELECT

			u.id AS id,
			u.name AS name,
			u.picture AS picture,
			u.admin AS admin,
			u.state AS state,
			u.createdat AS "createdAt",
			u.updatedat AS "updatedAt"

		FROM

			auth.credential AS cred

		JOIN auth.user AS u ON

			u.id = cred.id AND u.state = TRUE

		WHERE cred.email = email_param AND auth.verify_password(password_param, cred.password) = TRUE;

	END;

$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION auth.authenticate_by_token(token VARCHAR) RETURNS TABLE (

	id VARCHAR,
	name VARCHAR,
	picture VARCHAR,
	admin BOOLEAN,
	state BOOLEAN,
	"createdAt" TIMESTAMP,
	"updatedAt" TIMESTAMP

) AS $$

	BEGIN

		RETURN QUERY

		SELECT

			u.id AS id,
			u.name AS name,
			u.picture AS picture,
			u.admin AS admin,
			u.state AS state,
			u.createdat AS "createdAt",
			u.updatedat AS "updatedAt"

		FROM

			auth.user AS u

		JOIN auth.token AS t ON 

			u.id = t.user_id AND t.state = TRUE

		WHERE u.state = TRUE AND t.id = token;

	END;

$$ LANGUAGE plpgsql IMMUTABLE;

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

CREATE OR REPLACE PROCEDURE auth.set_credential(

	email_param VARCHAR, password_param VARCHAR, INOUT credential_id VARCHAR DEFAULT NULL

) LANGUAGE plpgsql AS $$

	BEGIN

		INSERT INTO auth.credential(

			email, password

		) VALUES (

			email_param, password_param

		) ON CONFLICT (email) DO UPDATE SET

			password = password_param

		RETURNING id INTO credential_id;

	END;

$$;

CREATE OR REPLACE PROCEDURE auth.create_account(

	email_param VARCHAR,
	password_param VARCHAR,
	name_param VARCHAR,
	admin_param BOOLEAN DEFAULT FALSE,
	picture_param VARCHAR DEFAULT NULL,
	INOUT account_id VARCHAR DEFAULT NULL

) LANGUAGE plpgsql AS $$

	BEGIN

		IF EXISTS(

			SELECT u.id FROM auth.user AS u WHERE u.name = name_param

		) THEN

			RAISE EXCEPTION 'DRFLD-002:%', name_param;

		END IF;

		IF EXISTS(

			SELECT cred.id FROM auth.credential AS cred WHERE cred.email = email_param

		) THEN

			RAISE EXCEPTION 'DRFLD-003:%', email_param;

		END IF;

		CALL auth.set_credential(email_param, password_param, account_id);

		INSERT INTO auth.user(

			id, name, admin

		) VALUES (account_id, name_param, admin_param);

		IF picture_param IS NOT NULL THEN

			UPDATE auth.user SET

				picture = picture_param

			WHERE id = account_id;

		END IF;

	EXCEPTION

		WHEN OTHERS THEN ROLLBACK;

		RAISE;

	END;

$$;

CREATE OR REPLACE PROCEDURE auth.create_token(

	email_param VARCHAR,
	password_param VARCHAR,
	uuid_param VARCHAR DEFAULT NULL,
	INOUT token VARCHAR DEFAULT NULL

) LANGUAGE plpgsql AS $$

	BEGIN

		INSERT INTO auth.token(

			user_id, uuid

		) SELECT

			u.id, uuid_param

		FROM

			auth.authenticate(email_param, password_param) AS u

		RETURNING id INTO token;

	EXCEPTION

		WHEN OTHERS THEN ROLLBACK;

		RAISE;

	END;

$$;

CREATE OR REPLACE PROCEDURE auth.refresh_token(

	token_id_param VARCHAR, uuid_param VARCHAR, INOUT token VARCHAR DEFAULT NULL

) LANGUAGE plpgsql AS $$

	BEGIN

		IF (uuid_param IS NULL OR NOT EXISTS(

			SELECT * FROM auth.token WHERE uuid = uuid_param

		)) THEN

			RAISE EXCEPTION 'DRFLD-001:%', uuid_param;

		END IF;

		INSERT INTO auth.token(

			user_id, uuid

		) SELECT

			t.user_id, t.uuid

		FROM

			auth.token AS t

		WHERE

			t.id = token_id_param AND t.uuid = uuid_param

		RETURNING id INTO token;

		UPDATE auth.token SET

			state = FALSE

		WHERE id = token_id_param;

	EXCEPTION

		WHEN OTHERS THEN ROLLBACK;

		RAISE;

	END;

$$;

CREATE OR REPLACE PROCEDURE auth.revoke_token(

	token_id_param VARCHAR, single_or_every BOOLEAN DEFAULT FALSE

) LANGUAGE plpgsql AS $$

	BEGIN

		IF (token_id_param IS NULL OR NOT EXISTS(

			SELECT * FROM auth.token AS t WHERE t.id = token_id_param

		)) THEN

			RAISE EXCEPTION 'DRFLD-000:%', token_id_param;

		END IF;

		IF single_or_every THEN

			UPDATE auth.token SET

				state = FALSE

			WHERE user_id IN (

				SELECT t.user_id FROM auth.token AS t WHERE t.id = token_id_param

			);

		ELSE

			UPDATE auth.token SET

				state = FALSE

			WHERE id = token_id_param;

		END IF;

	EXCEPTION

		WHEN OTHERS THEN ROLLBACK;

		RAISE;

	END;

$$;

CREATE OR REPLACE PROCEDURE auth.invalidate_expired_tokens() LANGUAGE plpgsql AS $$

	BEGIN

		UPDATE auth.token SET

			state = FALSE

		WHERE expiresat < CURRENT_TIMESTAMP AND state = TRUE;

		COMMIT;

	END;

$$;

CREATE OR REPLACE PROCEDURE auth.deactivate_account(account_id_param VARCHAR) LANGUAGE plpgsql AS $$

	BEGIN

		DELETE FROM auth.credential WHERE id = account_id_param;

		UPDATE auth.user SET

			state = FALSE

		WHERE id = account_id_param;

	EXCEPTION

		WHEN OTHERS THEN RAISE;

	END;

$$;