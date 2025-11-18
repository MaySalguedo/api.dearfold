import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { User } from '@user/entities/user.entity';
import { Issued } from '@models/issued.model';

import { UseGuards } from '@decorators/use-guard.decorator';
import { PublicGuard } from '@decorators/public-guard.decorator';
import { SignedUser } from '@decorators/signed-user.decorator';

import { Request } from 'express';

@Controller('user') export class UserController {

	public constructor(private readonly userService: UserService) {}

	@UseGuards('admin') @Get('/:id') public async findOne(@Param('id') id: string): Promise<User | null>{

		return await this.userService.findOne(id);

	}

	@UseGuards('admin') @Get('/') public async findAll(): Promise<Array<User>>{

		return await this.userService.findAll();

	}

	@Patch('/:id') public async update(

		@SignedUser() user: User & Issued,
		@Param('id') id: User['id'],
		@Body() dto: UpdateUserDto

	): Promise<void>{

		if (user.id!==id && !user.admin) throw new UnauthorizedException('Only authorized accounts can update users.');

		await this.userService.update(id, dto);

	}

}