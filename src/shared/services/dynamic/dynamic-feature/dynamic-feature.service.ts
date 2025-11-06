import { Injectable, Inject, Type, DynamicModule, Provider, Scope, BadRequestException, NotFoundException } from '@nestjs/common';

import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable() export class DynamicFeatureService {

	public constructor(@Inject('ALLOWED_PARAMETERS') private ALLOWED_PARAMETERS: Array<string | RegExp> = []) {}

	public forFeature(

		headerKey: string, providerKey: string, paramName?: string,
		providersCallback?: () => Array<Provider>, moduleCallback?: () => Array<DynamicModule['imports']>,

	): DynamicModule {

		const dynamicProviders = providersCallback ? providersCallback() : [];

		return {

			module: DynamicFeatureService,
			imports: [

				...(moduleCallback ? moduleCallback() : [])

			], providers: [

				{

					provide: providerKey,
					useFactory: (req: Request) => {

						const param = req.headers[headerKey] as string | undefined;

						if (!param){

							throw new NotFoundException(`${paramName ? paramName : headerKey} no encontrado`);

						}else if (!this.isParamValid(param)) {

							throw new BadRequestException([

								`${paramName ? paramName : headerKey} no permitido`,
								`${headerKey}: ${param}`

							]);

						}

						return param;

					}, inject: [REQUEST], scope: Scope.REQUEST

				}, ...dynamicProviders

			], exports: [

				...dynamicProviders, providerKey

			]

		} as unknown as DynamicModule;

	}

	public isParamValid(param: string): boolean {

		return this.ALLOWED_PARAMETERS.some(allowed => {

			if (allowed instanceof RegExp) {

				return allowed.test(param);

			}

			return allowed === param;

		});

	}

}