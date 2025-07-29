import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Auth } from './entities/auth.entity';
import { User } from '@user/entities/user.entity';
import { Attribute } from '@repo-types/attribute.type';
import { Request } from 'express';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { JwtGuard } from '@core/guards/jwt/jwt.guard';
import { TokenGuard } from '@core/guards/token/token.guard';

@Controller('auth') export class AuthController {

	public constructor(private readonly authService: AuthService) {}

	@UseGuards(JwtGuard) @Get('/status') public status(@Req() req: Request): User & {iat: number, exp: number} {

		return req.user as User & {iat: number, exp: number};

	}

	@Post('/logup') public logup(@Body() dto: CreateAuthDto & CreateUserDto): Promise<Attribute<User>> {

		return this.authService.logup(dto);

	}

	@UseGuards(AuthGuard) @Post('/login') public async login(@Req() req: Request, @Body() body: CreateAuthDto): Promise<{access_token: string, refresh_token: string}> {

		const access = req.user as string;

		return {

			access_token: access,
			refresh_token: (await this.authService.login(

				body.email, body.password, access, req.headers['uuid'] as string | undefined

			)).token

		};

	}

	@UseGuards(TokenGuard) @Post('/refresh') public async refresh(@Req() req: Request, @Body() body: {refresh_token: string}): Promise<{access_token: string, refresh_token: string}> {

		const access = req.user as string;

		return {

			access_token: access,
			refresh_token: (await this.authService.refresh(

				body.refresh_token, access, req.headers['uuid'] as string | undefined

			)).token

		};

	}

	@UseGuards(JwtGuard) @Delete('/logout') public async logout(@Req() req: Request): Promise<void> {

		const authHeader = req.headers.authorization as string;
		const access_token = authHeader.replace("Bearer ", "");

		this.authService.logout(access_token);

	}

	@UseGuards(JwtGuard) @Delete('/revoke') public async revoke(@Req() req: Request): Promise<void> {

		const authHeader = req.headers.authorization as string;
		const access_token = authHeader.replace("Bearer ", "");

		this.authService.revoke(access_token, true);

	}

}