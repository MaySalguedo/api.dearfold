import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { validate as uuidValidate, version as uuidVersion } from 'uuid';

import { ApiResponse } from '@interfaces/api/api-response.interface';

@Injectable() export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>>{

	public intercept(context: ExecutionContext & { rawHeaders?: Array<any> }, next: CallHandler): Observable<ApiResponse<T>> {

		const request = context.switchToHttp().getRequest();
		const tranform = request.headers['transform'];

		if (tranform==='true') {

			return next.handle().pipe(

				map(data => ({

					data,
					timestamp: new Date().toISOString(),
					//statusCode: context.switchToHttp().getResponse().statusCode,

				})),

			);

		}

		return next.handle();

	}

}