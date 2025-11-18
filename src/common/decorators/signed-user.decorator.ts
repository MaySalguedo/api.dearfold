import { createParamDecorator, ExecutionContext, PipeTransform, BadRequestException, Type } from '@nestjs/common';
import { User } from '@user/entities/user.entity';
import { Issued } from '@models/issued.model';

export const SignedUser = createParamDecorator((data: { 

	ctx: ExecutionContext

}, ctx: ExecutionContext): (User & Issued) | string => {

	const request = ctx.switchToHttp().getRequest();
	const user = request.user;

	if (!user) throw new BadRequestException([`Signed user not found upon request.`]);

	return user;

});