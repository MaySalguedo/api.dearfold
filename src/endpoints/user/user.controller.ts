import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Request } from 'express';
import { JwtGuard } from '@core/guards/jwt/jwt.guard';
import { AdminGuard } from '@core/guards/admin/admin.guard';

@Controller('user') export class UserController {

	public constructor(private readonly userService: UserService) {}

	@UseGuards(AdminGuard) @Get('/:id') public async findOne(@Param('id') id: string): Promise<User | null>{

		return this.userService.findOne(id);

	}

	@UseGuards(AdminGuard) @Get('/') public async findAll(): Promise<Array<User>>{

		return this.userService.findAll();

	}

	@UseGuards(JwtGuard) @Patch('/:id') public async update(@Req() req: Request, @Param('id') id: User['id'], @Body() dto: UpdateUserDto): Promise<void>{

		const user: User & {iat: number, exp: number} = req.user as User & {iat: number, exp: number};

		if (user.id!==id && !user.admin) throw new UnauthorizedException('Only authorized accounts can update users.');

		this.userService.update(id, dto);

	}

}