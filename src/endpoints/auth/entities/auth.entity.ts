import { Entity, Column } from 'typeorm';
import { Entity as BaseEntity } from '@models/entity.model';
import { Exclude } from 'class-transformer';

@Entity({

	name: 'credential',
	schema: 'auth'

}) export class Auth extends BaseEntity {

	@Column({

		name: 'email',
		type: 'varchar',
		nullable: false,
		length: 100

	}) public email: string;

	@Column({

		name: 'password',
		type: 'varchar',
		nullable: false,
		length: 60

	}) @Exclude() public password: string;

}