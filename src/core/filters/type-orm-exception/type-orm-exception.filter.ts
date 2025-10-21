import {

	ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Inject, Logger

} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import { ErrorMappingService } from '@core/services/error-mapping/error-mapping.service';

import { pgDriverError } from '@common/interfaces/api/postgres-driver-error.interface';
import { ErrorResponse } from '@common/interfaces/api/error-response.interface';
import { ApiErrorResponse } from '@common/interfaces/api/api-error-response.interface';

@Catch(

	QueryFailedError, EntityNotFoundError

) export class TypeOrmExceptionFilter implements ExceptionFilter {

	public constructor(private errorMappingService: ErrorMappingService) {}

	public catch(exception: QueryFailedError | EntityNotFoundError, host: ArgumentsHost): void {

		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		let result: ApiErrorResponse = {

			status: HttpStatus.INTERNAL_SERVER_ERROR,
			error: 'G001',
			message: exception.message,
			detail: [ exception.message ],
			timestamp: new Date().toISOString(),
			path: request.url

		};

		try {

			if (exception instanceof QueryFailedError) {

				const queryResult: ErrorResponse = this.handleQueryFailedError(exception);

				result = { ...result, ...queryResult };

			} else if (exception instanceof EntityNotFoundError) {

				result = { 

					...result,
					status: HttpStatus.NOT_FOUND,
					error: 'DB002',
					message: this.errorMappingService.getMessage('DB002', exception.message)

				};

			}

		} catch (filterError) {

			//throw new InternalServerErrorException(`Error while filtering exception. Last excepción: ${result.message}`);
			result.detail = [ `Error while filtering exception. Last excepción: ${result.message}` ];

		}

		response.status(result.status).json(result);

	}

	private handleQueryFailedError(exception: QueryFailedError): ErrorResponse {

		const exceptionDriver: QueryFailedError['driverError'] & pgDriverError = exception.driverError;

		const pgErrorCode: string | undefined = exceptionDriver?.code;
		const pgMessage: string = exception.message;
		const defaultMessage: string = exceptionDriver.detail || exceptionDriver.error || this.errorMappingService.getMessage('DB001', pgMessage);

		const customErrorMatch: RegExpMatchArray | null = pgMessage.match(/^(SPLC-\d{3}):\s*(.*)$/);

		if (customErrorMatch) {

			const [, code, params] = customErrorMatch;

			return {

				status: HttpStatus.BAD_REQUEST,
				error: code,
				message: this.errorMappingService.getMessage(code, `${params}`)

			};

		}

		if (pgErrorCode) {

			return this.pgException(pgErrorCode, pgMessage, defaultMessage);

		}

		return {

			status: HttpStatus.BAD_REQUEST,
			error: 'UNKNOWN',
			message: defaultMessage

		};

	}

	private pgException(pgErrorCode: string, pgMessage: string, defaultMessage: string): ErrorResponse {

		switch (pgErrorCode) {

			case '23505': // unique_violation

				return {

					status: HttpStatus.CONFLICT,
					error: 'DB003',
					message: this.errorMappingService.getMessage('DB003', pgMessage)

				};

			case '23503': // foreign_key_violation

				return {

					status: HttpStatus.CONFLICT,
					error: 'DB004',
					message: this.errorMappingService.getMessage('DB004', pgMessage)

				};

			case '23502': // not_null_violation

				return {

					status: HttpStatus.BAD_REQUEST,
					error: 'G002',
					message: this.errorMappingService.getMessage('G002', pgMessage)

				};

			default:

				return {

					status: HttpStatus.BAD_REQUEST,
					error: `UNKNOWN-${pgErrorCode}`,
					message: defaultMessage

				};

		}

	}

}