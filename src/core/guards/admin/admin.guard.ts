import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AuthService } from '@auth/auth.service';
import { User } from '@user/entities/user.entity';

@Injectable() export class AdminGuard extends AuthGuard('jwt') {

	public constructor(private readonly authService: AuthService) {

		super();

	}

	public async canActivate(context: ExecutionContext): Promise<boolean> {

		const firstGuard = await super.canActivate(context);/**/

		if (!firstGuard) return firstGuard;

		const request = context.switchToHttp().getRequest();

		const user: User & {iat: number, exp: number} = request.user;

		if (!user.admin) throw new UnauthorizedException('Unauthorized');

		return true;

	}

}