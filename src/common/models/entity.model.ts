import { PrimaryColumn, Column, CreateDateColumn, BaseEntity } from 'typeorm';

export class Entity<T = string> extends BaseEntity {

	@PrimaryColumn({

		name: 'id',
		type: 'varchar',
		length: 64

	}) public id: T;

	@Column({

		name: 'state',
		type: 'boolean',
		nullable: false,
		default: true

	}) public state: boolean;

	@CreateDateColumn({

		name: 'createdat',
		type: 'timestamp',
		nullable: false

	}) public createdAt: Date;

	@CreateDateColumn({

		name: 'updatedat',
		type: 'timestamp',
		nullable: false

	}) public updatedAt: Date;

}