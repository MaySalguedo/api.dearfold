import { Entity, Column } from 'typeorm';
import { Entity as BaseEntity } from '@models/entity.model';

@Entity({

	name: 'user',
	schema: 'auth'

}) export class User extends BaseEntity {

	@Column({

		name: 'name',
		type: 'varchar',
		length: 20,
		nullable: false,
		unique: true

	}) public name: string;

	@Column({

		name: 'picture',
		type: 'varchar',
		length: 1000,
		nullable: false,
		default: 'https://avatars.githubusercontent.com/u/0?v=4'

	}) public picture?: string;

	@Column({

		name: 'admin',
		type: 'boolean',
		nullable: false,
		default: false

	}) public admin?: boolean = false;

}