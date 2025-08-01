\c dearfold;

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