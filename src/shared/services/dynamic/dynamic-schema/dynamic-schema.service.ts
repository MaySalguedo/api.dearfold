import { Injectable, DynamicModule, Scope } from '@nestjs/common';

import { DataSource, DataSourceOptions, EntityTarget, Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { databaseConfig, ALLOWED_SCHEMAS } from '@core/config/env.config';

import { DynamicFeatureService } from '@shared/services/dynamic/dynamic-feature/dynamic-feature.service';

@Injectable() export class DynamicSchemaService {

	public constructor() {}

	public static forRoot(entities: Array<any>): DynamicModule {

		const dynamicFeatureService = new DynamicFeatureService(ALLOWED_SCHEMAS);

		return dynamicFeatureService.forFeature('x-schema', 'SCHEMA_CONTEXT', 'Schema', () => {

			return entities.map((entity) => ({

				provide: getRepositoryToken(entity),
				useFactory: (dataSource: DataSource, schema: string) => {

					const repository = dataSource.getRepository(entity);
					repository.metadata.schema = schema;
					repository.metadata.tablePath = `${schema}.${repository.metadata.tableName}`;

					return repository;

				}, inject: [DataSource, 'SCHEMA_CONTEXT'], scope: Scope.REQUEST,

			}));

		}, () => {

			return [

				TypeOrmModule.forRootAsync({

					useFactory: () => databaseConfig as DataSourceOptions,
					dataSourceFactory: async (options: DataSourceOptions) => {

						return new DataSource(options).initialize();

					}

				}), TypeOrmModule.forFeature(entities)

			] as unknown as Array<DynamicModule['imports']>;

		});

	}

}