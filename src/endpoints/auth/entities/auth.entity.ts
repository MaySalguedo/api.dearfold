import { Entity, Column } from 'typeorm';
import { Entity as BaseEntity } from '@models/entity.model';

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

}