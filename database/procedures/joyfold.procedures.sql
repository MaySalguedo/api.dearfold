\c joyfold;

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

			RAISE EXCEPTION 'The username % is already taken.', name_param;

		END IF;

		IF EXISTS(

			SELECT cred.id FROM auth.credential AS cred WHERE cred.email = email_param

		) THEN

			RAISE EXCEPTION 'The email % has been logged up already. Try a different one.', email_param;

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
	access_token_param VARCHAR,
	uuid_param VARCHAR DEFAULT NULL,
	INOUT token VARCHAR DEFAULT NULL

) LANGUAGE plpgsql AS $$

	BEGIN

		INSERT INTO auth.token(

			user_id, uuid, access_token

		) SELECT

			u.id, uuid_param, access_token_param

		FROM

			auth.authenticate(email_param, password_param) AS u

		RETURNING id INTO token;

	EXCEPTION

		WHEN OTHERS THEN ROLLBACK;

		RAISE;

	END;

$$;

CREATE OR REPLACE PROCEDURE auth.refresh_token(

	token_id_param VARCHAR, access_token_param VARCHAR, uuid_param VARCHAR, INOUT token VARCHAR DEFAULT NULL

) LANGUAGE plpgsql AS $$

	BEGIN

		IF (uuid_param IS NULL OR NOT EXISTS(

			SELECT * FROM auth.token WHERE uuid = uuid_param

		)) THEN

			RAISE EXCEPTION 'Invalid uuid.';

		END IF;

		INSERT INTO auth.token(

			user_id, uuid, access_token

		) SELECT

			t.user_id, t.uuid, access_token_param

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

	access_token_param VARCHAR, single_or_every BOOLEAN DEFAULT FALSE

) LANGUAGE plpgsql AS $$

	BEGIN

		IF (access_token_param IS NULL OR NOT EXISTS(

			SELECT * FROM auth.token WHERE access_token = access_token_param

		)) THEN

			RAISE EXCEPTION 'Invalid token.';

		END IF;

		IF single_or_every THEN

			UPDATE auth.token SET

				state = FALSE

			WHERE user_id IN (

				SELECT t.user_id FROM auth.token AS t WHERE access_token = access_token_param

			);

		ELSE

			UPDATE auth.token SET

				state = FALSE

			WHERE access_token = access_token_param;

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