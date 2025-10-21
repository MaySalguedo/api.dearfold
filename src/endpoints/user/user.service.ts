import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from './interfaces/user.interface';
import { User } from './entities/user.entity';
import { ProcedureException } from '@exceptions/procedure.exception';
import { QueryException } from '@exceptions/query.exception';
import { Attribute } from '@repo-types/attribute.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';

@Injectable() export class UserService implements IUser {

	public constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

	public async findOne(id: User['id']): Promise<User | null>{

		return await this.userRepository.findOne({

			where: {

				id: id

			}

		});

	}

	public async findAll(): Promise<Array<User>>{

		return await this.userRepository.find();

	}

	public async update(id: User['id'], updateUserDto: UpdateUserDto): Promise<void> {

		let user: User | undefined = await this.userRepository.preload({

			id: id,
			...updateUserDto

		});

		if (user===undefined){

			throw new NotFoundException(`User with id: ${id} was not found.`);

		}

		await validate(user);

		await this.userRepository.save(user);

	}

}