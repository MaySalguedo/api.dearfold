import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '@user/entities/user.entity';

@Injectable() export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

	public constructor() {

		super({

			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET || '',

		});

	}

	public validate(payload: User & {iat: number, exp: number}): User & {iat: number, exp: number} {

		return payload;

	}

}