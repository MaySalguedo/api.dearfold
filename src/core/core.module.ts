import { Module, NotFoundException } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/env.config';

import { AuthModule } from '@auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthStrategy } from './strategies/auth/auth.strategy';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { TokenStrategy } from './strategies/token/token.strategy';

import { AuthGuard } from './guards/auth/auth.guard';
import { JwtGuard } from './guards/jwt/jwt.guard';
import { AdminGuard } from './guards/admin/admin.guard';
import { TokenGuard } from './guards/token/token.guard';

import { Client, Storage } from 'node-appwrite';

@Module({

	imports: [

		TypeOrmModule.forRoot(databaseConfig), AuthModule, PassportModule, JwtModule.register({

			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '4h' }

		})

	], providers: [

		AuthStrategy, JwtStrategy, AuthGuard, JwtGuard, AdminGuard, TokenStrategy, TokenGuard, {

			provide: Client,
			useFactory: () => {

				const endpoint: string | undefined = process.env.APPWRITE_ENDPOINT;
				const project: string | undefined = process.env.APPWRITE_PROJECT_ID;
				const key: string | undefined = process.env.APPWRITE_KEY_SECRET;

				if (!endpoint || !project || !key){

					throw new NotFoundException('Appwrite environment variables could not be found.');

				}

				return new Client().setEndpoint(endpoint).setProject(project).setKey(key);

			}

		}, {

			provide: Storage,
			useFactory: (client: Client) => {

				return new Storage(client);

			}

		}

	], exports: []

}) export class CoreModule {}