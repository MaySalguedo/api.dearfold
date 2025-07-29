import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard as Guard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable() export class AuthGuard extends Guard('local') {

	public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

		return super.canActivate(context);

	}

}