import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, BadRequestException, ParseUUIDPipe } from '@nestjs/common';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { User } from '@user/entities/user.entity';
import { Issued } from '@models/issued.model';

import { Attribute } from '@repo-types/attribute.type';

import { UseGuards } from '@decorators/use-guard.decorator';
import { PublicGuard } from '@decorators/public-guard.decorator';
import { HeaderParam } from '@decorators/header-param.decorator';
import { SignedUser } from '@decorators/signed-user.decorator';
import { RefreshToken } from '@decorators/refresh-token.decorator';

import { Request } from 'express';

@Controller('auth') export class AuthController {

	public constructor(private readonly authService: AuthService) {}

	@Get('/status') public status(@SignedUser() user: User & Issued): User & Issued {

		return user;

	}

	@PublicGuard() @Post('/logup') public async logup(@Body() dto: CreateAuthDto & CreateUserDto): Promise<Attribute<User>> {

		return {

			id: await this.authService.logup(dto)

		}

	}

	@UseGuards('auth') @Post('/login') public async login(

		@Body() body: CreateAuthDto,
		@SignedUser() user: string,
		@HeaderParam('uuid', false, ParseUUIDPipe) uuid?: string

	): Promise<{ access_token: string, refresh_token: string }> {

		return {

			access_token: user,
			refresh_token: await this.authService.login(

				body.email, body.password, uuid

			)

		};

	}

	@UseGuards('token') @Post('/refresh') public async refresh(

		@RefreshToken() token: string,
		@SignedUser() user: string,
		@HeaderParam('uuid', true, ParseUUIDPipe) uuid: string

	): Promise<{ access_token: string, refresh_token: string }> {

		return {

			access_token: user,
			refresh_token: await this.authService.refresh(

				token, uuid

			)

		};

	}

	@Patch(':id') public async update(

		@SignedUser() user: User & Issued,
		@Param('id') id: Auth['id'],
		@Body() dto: UpdateAuthDto

	): Promise<void>{

		if (user.id!==id && !user.admin) throw new UnauthorizedException('Only authorized accounts can update users.');

		await this.authService.update(id, dto);

	}

	@Delete('/logout') public async logout(@RefreshToken() token: string): Promise<void> {

		console.log(token);

		await this.authService.logout(token);

	}/**/

	@UseGuards('admin') @Delete('/revoke') public async revoke(@RefreshToken() token: string): Promise<void> {

		await this.authService.revoke(token, true);

	}

	@Delete(':id') public async toggle(

		@SignedUser() user: User & Issued,
		@Param('id') id: Auth['id']

	): Promise<void>{

		if (user.id!==id && !user.admin) throw new UnauthorizedException('Only authorized accounts can delete users.');

		await this.authService.toggle(id);

	}

}