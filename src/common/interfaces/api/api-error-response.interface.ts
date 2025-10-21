import { ErrorResponse } from './error-response.interface';

export interface ApiErrorResponse extends ErrorResponse {

	detail: Array<string>,
	timestamp: string,
	path: string

}