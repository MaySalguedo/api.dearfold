import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const RefreshToken = createParamDecorator((data: { 

	ctx: ExecutionContext

}, ctx: ExecutionContext): string => {

	const request = ctx.switchToHttp().getRequest();
	const token = request.body.refresh_token;

	if (!token) throw new BadRequestException([`refresh_token cannot be empty.`]);

	return token;

});