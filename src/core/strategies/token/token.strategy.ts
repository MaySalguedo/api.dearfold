import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { AuthService } from '@auth/auth.service';
import { User } from '@user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable() export class TokenStrategy extends PassportStrategy(Strategy, 'token') {

	public constructor(

		private readonly authService: AuthService,
		private readonly jwtService: JwtService

	) {

		super();

	}

	public async validate(req: Request): Promise<any> {

		const user: User | undefined = await this.authService.authenticate_by_token(req.body.refresh_token);

		if (!user) throw new UnauthorizedException('Invalid or expired refresh token');

		return this.jwtService.sign(user);

	}

}