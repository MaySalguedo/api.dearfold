import {

	ExceptionFilter, Catch, ArgumentsHost, HttpStatus,
	InternalServerErrorException, BadRequestException, NotFoundException,
	UnauthorizedException, ForbiddenException, ConflictException

} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorMappingService } from '@core/services/error-mapping/error-mapping.service';

import { ApiErrorResponse } from '@common/interfaces/api/api-error-response.interface';

import { FailedDependencyException } from '@exceptions/failed-dependency.exception';

@Catch(

	BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException,
	InternalServerErrorException, ConflictException, FailedDependencyException

) export class PipelineFilter implements ExceptionFilter {

	public constructor(private errorMappingService: ErrorMappingService) {}

	catch(

		exception: BadRequestException | NotFoundException | UnauthorizedException | ForbiddenException | InternalServerErrorException | ConflictException | FailedDependencyException,
		host: ArgumentsHost

	): void {

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

			if (exception instanceof InternalServerErrorException){

				const responseMessage = exception.getResponse();

				if (typeof responseMessage === 'object' && responseMessage !== null) {

					const resp = responseMessage as Record<string, any>;
					if (resp.error) result.detail.push(String(resp.error));
					if (resp.error_description) result.detail.push(String(resp.error_description));

				}

			}if (exception instanceof BadRequestException) {

				const responseMessage = exception.getResponse();

				if (typeof responseMessage === 'string' || 'message' in responseMessage) {

					result.detail = typeof responseMessage === 'object' && 'message' in responseMessage && Array.isArray(responseMessage.message)
						? responseMessage.message : [

							typeof responseMessage === 'string' ? responseMessage : responseMessage.message

					];

				}

				result.status =  HttpStatus.BAD_REQUEST;
				result.error =  'G002';
				result.message = this.errorMappingService.getMessage(result.error, exception.message);

			} else if (exception instanceof FailedDependencyException) {

				result = {

					...result,
					status: HttpStatus.FAILED_DEPENDENCY,
					error: 'G003',
					message: this.errorMappingService.getMessage('G003', exception.message)

				};

			} else if (exception instanceof UnauthorizedException) {

				result = {

					...result,
					status: HttpStatus.UNAUTHORIZED,
					error: 'G000',
					message: this.errorMappingService.getMessage('G000', exception.message)

				};

			} else if (exception instanceof ForbiddenException) {

				result = {

					...result,
					status: HttpStatus.FORBIDDEN,
					error: 'G004',
					message: this.errorMappingService.getMessage('G004', exception.message)

				};

			} else if (exception instanceof NotFoundException) {

				result = {

					...result,
					status: HttpStatus.NOT_FOUND,
					error: 'G005',
					message: this.errorMappingService.getMessage('G005', exception.message)

				};

			} else if (exception instanceof ConflictException) {

				result = {

					...result,
					status: HttpStatus.CONFLICT,
					error: 'G006',
					message: this.errorMappingService.getMessage('G006', exception.message)

				};

			}

		} catch (filterError) {

			result.detail = [ `Error while filtering exception. Last excepción: ${result.message}` ];

		}

		response.status(result.status).json(result);

	}

}