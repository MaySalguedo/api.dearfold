import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { IS_PUBLIC_KEY } from '@decorators/public-guard.decorator';

@Injectable() export class JwtGuard extends AuthGuard('jwt') {

	public canActivate(context: ExecutionContext): boolean | Promise<boolean> {

		return super.canActivate(context) as boolean | Promise<boolean>;

	}

}