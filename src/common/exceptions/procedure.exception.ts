import { InternalServerErrorException } from '@nestjs/common';

export class ProcedureException extends InternalServerErrorException {

	public constructor(message?: string) {

		super(message);

	}

}