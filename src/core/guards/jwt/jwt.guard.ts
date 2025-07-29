import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AuthService } from '@auth/auth.service';

@Injectable() export class JwtGuard extends AuthGuard('jwt') {

	public constructor(private readonly authService: AuthService) {

		super();

	}

	public async canActivate(context: ExecutionContext): Promise<boolean> {

		const firstGuard = super.canActivate(context);/**/

		if (!firstGuard) return firstGuard;

		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers.authorization

		const token = authHeader.replace("Bearer ", "");
		const authorized = await this.authService.authorize(token);

		if (!authorized) throw new UnauthorizedException('Unauthorized');

		return true;

	}

}