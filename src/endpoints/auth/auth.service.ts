import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { IAuth } from './interfaces/auth.interface';
import { Auth } from './entities/auth.entity';
import { User } from '@user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';

@Injectable() export class AuthService implements IAuth<Auth, CreateAuthDto & CreateUserDto> {

	public constructor(@InjectRepository(Auth) private readonly authRepository: Repository<Auth>) {}

	public async logup(user: CreateAuthDto & CreateUserDto): Promise<User['id']> {

		const resultSet = await this.authRepository.query(

			`CALL auth.create_account($1, $2, $3, $4, $5)`,
			[user.email, user.password, user.name, null, !user.picture ? null : user.picture]

		);

		return resultSet[0].account_id;

	}

	public async login(email: Auth['email'], password: Auth['password'], uuid?: string): Promise<string> {

		const resultSet = await this.authRepository.query(

			`CALL auth.create_token($1, $2, $3)`,
			[email, password, !uuid ? null : uuid]

		);

		return resultSet[0].token;

	}

	public async logout(token: string): Promise<void> {

		return this.revoke(token, false);

	}

	public async update(id: Auth['id'], updateAuthDto: UpdateAuthDto): Promise<void> {

		let cred: Auth | undefined = await this.authRepository.preload({

			id: id,
			...updateAuthDto

		});

		if (cred===undefined){

			throw new NotFoundException(`Credentials with id: ${id} were not found.`);

		}

		await validate(cred);

		await this.authRepository.save(cred);

	}

	public async toggle(id: Auth['id']): Promise<void> {

		await this.authRepository.query(

			`CALL auth.deactivate_account($1)`,
			[id]

		);

	}

	/*public async authorize(token: string): Promise<boolean> {

		try{

			const resultSet = await this.authRepository.query(

				`SELECT * FROM auth.authorize($1)`,
				[token]

			);

			return resultSet.length===0 ? false : resultSet[0].authorize;

		}catch(e){

			throw new ProcedureException(e.message);

		}

	}/**/

	public async authenticate(email: string, password: string): Promise<User | undefined> {

		const resultSet = await this.authRepository.query(

			`SELECT * FROM auth.authenticate($1, $2)`,
			[email, password]

		);

		return resultSet.length===0 ? undefined : resultSet[0];

	}

	public async authenticate_by_token(token: string): Promise<User | undefined> {

		const resultSet = await this.authRepository.query(

			`SELECT * FROM auth.authenticate_by_token($1)`,
			[token]

		);

		return resultSet.length===0 ? undefined : resultSet[0];

	}

	public async refresh(token: string, uuid?: string): Promise<string> {

		const resultSet = await this.authRepository.query(

			`CALL auth.refresh_token($1, $2)`,
			[token, uuid]

		);

		return resultSet[0].token;

	}

	public async revoke(token: string, SingleOrEvery: boolean): Promise<void> {

		await this.authRepository.query(

			`CALL auth.revoke_token($1, $2)`,
			[token, SingleOrEvery]

		);

	}

	@Cron(CronExpression.EVERY_HOUR) public async invalidate_expired_tokens(): Promise<void> {

		const resultSet = await this.authRepository.query(

			`CALL auth.invalidate_expired_tokens()`,
			[]

		);

	}

}