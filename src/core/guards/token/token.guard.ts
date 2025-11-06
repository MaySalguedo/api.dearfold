import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable() export class TokenGuard extends AuthGuard('token') {

	public canActivate(context: ExecutionContext): boolean | Promise<boolean> {

		return super.canActivate(context) as boolean | Promise<boolean>;

	}

}