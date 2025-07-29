import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ProcedureException } from '@exceptions/procedure.exception';
import { Attribute } from '@repo-types/attribute.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable() export class UserService {

	public constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

}