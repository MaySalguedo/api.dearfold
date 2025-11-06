import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Auth } from '@auth/entities/auth.entity';
import { User } from '@user/entities/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const entities = [

	Auth, User

];

export const databaseConfig: TypeOrmModuleOptions = {

	type: 'postgres',
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	entities: entities,
	synchronize: false,
	extra: {

		options: "-c client_encoding=utf8"

	},
	//url: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?client_encoding=UTF8`

};

export const ALLOWED_SCHEMAS: Array<string> = [];