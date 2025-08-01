import { HttpException, HttpStatus } from '@nestjs/common';

export class NotModifiedException extends HttpException {

	public constructor(message: string = 'Not Modified') {

		super(message, HttpStatus.NOT_MODIFIED);

	}

}