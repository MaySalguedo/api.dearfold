import { Module } from '@nestjs/common';

import { APP_FILTER, APP_GUARD } from '@nestjs/core';

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
import { OrchestratorGuard } from './guards/orchestrator/orchestrator.guard';

import { ErrorMappingService } from './services/error-mapping/error-mapping.service';

import { TypeOrmExceptionFilter } from './filters/type-orm-exception/type-orm-exception.filter';
import { PipelineFilter } from './filters/pipeline/pipeline.filter';

import { Client, Storage } from 'node-appwrite';

import { FailedDependencyException } from '@exceptions/failed-dependency.exception';

@Module({

	imports: [

		TypeOrmModule.forRoot(databaseConfig), AuthModule, PassportModule, JwtModule.register({

			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '4h' }

		})

	], providers: [

		AuthStrategy, JwtStrategy, TokenStrategy,
		AuthGuard, JwtGuard, AdminGuard, TokenGuard, OrchestratorGuard, {

			provide: APP_GUARD,
			useClass: OrchestratorGuard

		}, ErrorMappingService, TypeOrmExceptionFilter, PipelineFilter, {

			provide: APP_FILTER,
			useFactory: (errorMappingService: ErrorMappingService) => {

				return new TypeOrmExceptionFilter(errorMappingService);

			}, inject: [ErrorMappingService]

		}, {

			provide: APP_FILTER,
			useFactory: (errorMappingService: ErrorMappingService) => {

				return new PipelineFilter(errorMappingService);

			}, inject: [ErrorMappingService]

		}

	], exports: [

		AuthGuard, JwtGuard, AdminGuard, TokenGuard, OrchestratorGuard

	]

}) export class CoreModule {}