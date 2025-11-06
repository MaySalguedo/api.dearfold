import { Injectable, ExecutionContext, CanActivate, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { USE_GUARDS_KEY } from '@decorators/use-guard.decorator';
import { IS_PUBLIC_KEY } from '@decorators/public-guard.decorator';
import { Guard } from '@repo-types/guard.type';

import { JwtGuard } from '@guards/jwt/jwt.guard';
import { AuthGuard } from '@guards/auth/auth.guard';
import { TokenGuard } from '@guards/token/token.guard';
import { AdminGuard } from '@guards/admin/admin.guard';

@Injectable() export class OrchestratorGuard implements CanActivate {

	public constructor(

		private reflector: Reflector,
		private jwtGuard: JwtGuard, private authGuard: AuthGuard,
		private tokenGuard: TokenGuard, private adminGuard: AdminGuard,

	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {

		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [

			context.getHandler(),
			context.getClass(),

		]);

		if (isPublic) {

			return true;

		}

		const guardTypes = this.reflector.getAllAndOverride<Guard[]>(USE_GUARDS_KEY, [

			context.getHandler(),
			context.getClass(),

		]);

		if (!guardTypes || guardTypes.length === 0) {

			return this.jwtGuard.canActivate(context);

		}

		return this.executeGuards(context, guardTypes);
	}

	private async executeGuards(context: ExecutionContext, guardTypes: Array<Guard>): Promise<boolean> {

		const guardMap: Record<Guard, CanActivate> = {

			'jwt': this.jwtGuard,
			'auth': this.authGuard,
			'token': this.tokenGuard,
			'admin': this.adminGuard,

		};

		for (const guardType of guardTypes) {

			const guard = guardMap[guardType];

			if (!guard) {

				throw new NotFoundException(`Guard '${guardType}' was not found`);

			}

			return await guard.canActivate(context) as unknown as Promise<boolean>;

		}

		return true;

	}

}