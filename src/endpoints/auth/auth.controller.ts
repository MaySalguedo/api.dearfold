import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Auth } from './entities/auth.entity';
import { User } from '@user/entities/user.entity';
import { Attribute } from '@repo-types/attribute.type';
import { Interacted } from '@repo-types/interacted.type';
import { Request } from 'express';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { JwtGuard } from '@core/guards/jwt/jwt.guard';
import { AdminGuard } from '@core/guards/admin/admin.guard';
import { TokenGuard } from '@core/guards/token/token.guard';

@Controller('auth') export class AuthController {

	public constructor(private readonly authService: AuthService) {}

	@UseGuards(JwtGuard) @Get('/status') public status(@Req() req: Request): User & {iat: number, exp: number} {

		return req.user as User & {iat: number, exp: number};

	}

	@Post('/logup') public async logup(@Body() dto: CreateAuthDto & CreateUserDto): Promise<Attribute<User>> {

		return {

			id: await this.authService.logup(dto)

		}

	}

	@UseGuards(AuthGuard) @Post('/login') public async login(@Req() req: Request, @Body() body: CreateAuthDto): Promise<{access_token: string, refresh_token: string}> {

		const access = req.user as string;

		return {

			access_token: access,
			refresh_token: await this.authService.login(

				body.email, body.password, req.headers['uuid'] as string | undefined

			)

		};

	}

	@UseGuards(TokenGuard) @Post('/refresh') public async refresh(@Req() req: Request, @Body() body: {refresh_token?: string}): Promise<{access_token: string, refresh_token: string}> {

		console.log(req.cookies['refresh_token']);
		const token = body.refresh_token;

		if (!token) throw new BadRequestException('refresh_token cannot be empty.');

		return {

			access_token: req.user as string,
			refresh_token: await this.authService.refresh(

				token, req.headers['uuid'] as string | undefined

			)

		};

	}

	@UseGuards(JwtGuard) @Patch(':id') public async update(@Req() req: Request, @Param('id') id: Auth['id'], @Body() dto: UpdateAuthDto): Promise<void>{

		const user: User & {iat: number, exp: number} = req.user as User & {iat: number, exp: number};

		if (user.id!==id && !user.admin) throw new UnauthorizedException('Only authorized accounts can update users.');

		this.authService.update(id, dto);

	}

	@UseGuards(JwtGuard) @Delete(':id') public async toggle(@Req() req: Request, @Param('id') id: Auth['id']): Promise<void>{

		const user: User & {iat: number, exp: number} = req.user as User & {iat: number, exp: number};

		if (user.id!==id && !user.admin) throw new UnauthorizedException('Only authorized accounts can delete users.');

		this.authService.toggle(id);

	}

	@UseGuards(JwtGuard) @Delete('/logout') public async logout(@Body() body: {refresh_token?: string}): Promise<void> {

		const token = body.refresh_token;

		if (!token) throw new BadRequestException('refresh_token cannot be empty.');

		this.authService.logout(token);

	}

	@UseGuards(AdminGuard) @Delete('/revoke') public async revoke(@Body() body: {refresh_token?: string}): Promise<void> {

		const token = body.refresh_token;

		if (!token) throw new BadRequestException('refresh_token cannot be empty.');

		this.authService.revoke(token, true);

	}

}