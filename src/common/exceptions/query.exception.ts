import { ConflictException } from '@nestjs/common';

export class QueryException extends ConflictException {

	public constructor(message?: string) {

		super(message);

	}

}