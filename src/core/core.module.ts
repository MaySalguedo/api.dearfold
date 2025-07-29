import { Module } from '@nestjs/common';

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
import { TokenGuard } from './guards/token/token.guard';

@Module({

	imports: [

		TypeOrmModule.forRoot(databaseConfig),
		AuthModule,
		PassportModule,
		JwtModule.register({

			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '4h' }

		})

	], providers: [

		AuthStrategy, JwtStrategy, AuthGuard, JwtGuard, TokenStrategy, TokenGuard

	], exports: []

}) export class CoreModule {}