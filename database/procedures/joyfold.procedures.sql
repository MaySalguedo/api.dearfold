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