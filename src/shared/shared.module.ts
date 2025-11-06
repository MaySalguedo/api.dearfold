import { Module, DynamicModule } from '@nestjs/common';

import { entities, ALLOWED_SCHEMAS } from '@core/config/env.config';

import { TypeOrmModule } from '@nestjs/typeorm';

import { DynamicFeatureService } from './services/dynamic/dynamic-feature/dynamic-feature.service';

@Module({

	imports: [

		TypeOrmModule.forFeature(entities)

	], providers: [

		{

			provide: 'ALLOWED_PARAMETERS',
			useValue: ALLOWED_SCHEMAS

		}, DynamicFeatureService

	], exports: [

		TypeOrmModule, DynamicFeatureService

	]

}) export class SharedModule {}