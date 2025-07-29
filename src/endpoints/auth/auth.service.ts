import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Auth } from './entities/auth.entity';
import { User } from '@user/entities/user.entity';
import { ProcedureException } from '@exceptions/procedure.exception';
import { Attribute } from '@repo-types/attribute.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable() export class AuthService {

	public constructor(@InjectRepository(Auth) private readonly authRepository: Repository<Auth>) {}

	public async logup(user: CreateAuthDto & CreateUserDto): Promise<Attribute<User>> {

		try{

			const resultSet = await this.authRepository.query(

				`CALL auth.create_account($1, $2, $3, $4, $5)`,
				[user.email, user.password, user.name, null, !user.picture ? null : user.picture]

			);

			return {

				id: resultSet[0].account_id

			}

		}catch(e){

			throw new ProcedureException(e.message);

		}

	}

	public async login(email: string, password: string, access_token: string, uuid?: string): Promise<{token: string}> {

		try{

			const resultSet = await this.authRepository.query(

				`CALL auth.create_token($1, $2, $3, $4)`,
				[email, password, access_token, !uuid ? null : uuid]

			);

			return {

				token: resultSet[0].token

			}

		}catch(e){

			throw new ProcedureException(e.message);

		}

	}

	public async logout(access_token: string): Promise<void> {

		return this.revoke(access_token, false);

	}

	public async authorize(token: string): Promise<boolean> {

		try{

			const resultSet = await this.authRepository.query(

				`SELECT * FROM auth.authorize($1)`,
				[token]

			);

			return resultSet.length===0 ? false : resultSet[0].authorize;

		}catch(e){

			throw new ProcedureException(e.message);

		}

	}

	public async authenticate(email: string, password: string): Promise<User | undefined> {

		try{

			const resultSet = await this.authRepository.query(

				`SELECT * FROM auth.authenticate($1, $2)`,
				[email, password]

			);

			return resultSet.length===0 ? undefined : resultSet[0];

		}catch(e){

			throw new ProcedureException(e.message);

		}

	}

	public async authenticate_by_token(token: string): Promise<User | undefined> {

		try{

			const resultSet = await this.authRepository.query(

				`SELECT * FROM auth.authenticate_by_token($1)`,
				[token]

			);

			return resultSet.length===0 ? undefined : resultSet[0];

		}catch(e){

			throw new ProcedureException(e.message);

		}

	}

	public async refresh(token: string, access_token: string, uuid?: string): Promise<{token: string}> {

		try{

			const resultSet = await this.authRepository.query(

				`CALL auth.refresh_token($1, $2, $3)`,
				[token, access_token, uuid]

			);

			return {

				token: resultSet[0].token

			}

		}catch(e){

			throw new ProcedureException(e.message);

		}

	}

	public async revoke(access_token: string, SingleOrEvery: boolean): Promise<void> {

		try{

			await this.authRepository.query(

				`CALL auth.revoke_token($1, $2)`,
				[access_token, SingleOrEvery]

			);

		}catch(e){

			throw new ProcedureException(e.message);

		}

	}

	@Cron(CronExpression.EVERY_HOUR) public async invalidate_expired_tokens(): Promise<void> {

		try{

			const resultSet = await this.authRepository.query(

				`CALL auth.invalidate_expired_tokens()`,
				[]

			);

		}catch(e){

			throw new ProcedureException(e.message);

		}

	}

}