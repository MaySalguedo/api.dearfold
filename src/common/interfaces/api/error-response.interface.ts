import { HttpStatus } from '@nestjs/common';

export interface ErrorResponse {

	status: HttpStatus,
	error: string,
	message: string

}