import { createParamDecorator, ExecutionContext, PipeTransform, BadRequestException, Type } from '@nestjs/common';

export const HeaderParam = (

	headerKey: string, required: boolean = true, pipeClass?: Type<PipeTransform>

) => {

	return createParamDecorator(async (data: { 

		headerKey: string; 
		required: boolean; 
		pipeClass?: Type<PipeTransform> 

	}, ctx: ExecutionContext) => {

		const request = ctx.switchToHttp().getRequest();
		const headerValue = request.headers[headerKey.toLowerCase()];

		if (required && !headerValue) throw new BadRequestException([`Header param ${headerKey} is required`]);

		if (!headerValue) {

			return undefined;

		}

		if (pipeClass) {

			const pipeInstance = new pipeClass();
			return await pipeInstance.transform(headerValue, { type: 'custom' });

		}

		return headerValue;

	})({ headerKey, required, pipeClass });

};