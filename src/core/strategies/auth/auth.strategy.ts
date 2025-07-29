import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '@auth/auth.service';
import { User } from '@user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable() export class AuthStrategy extends PassportStrategy(Strategy, 'local') {

	public constructor(

		private readonly authService: AuthService,
		private readonly jwtService: JwtService

	) {

		super({

			usernameField: 'email',
			passwordField: 'password'

		});

	}

	public async validate(email: string, password: string): Promise<string> {

		const user: User | undefined = await this.authService.authenticate(email, password);

		if (!user) throw new UnauthorizedException('Invalid Credentials');

		return this.jwtService.sign(user);

	}

}