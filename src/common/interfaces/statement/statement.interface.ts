import { PartialType } from '@nestjs/mapped-types';
import { Entity } from '@models/entity.model';
import { Dto } from '@models/dto.model';

export interface IStatement<T extends Entity<unknown>, D extends Dto<T>> {

	insert(dto: D): Promise<T['id'] | undefined>;

	update(id: T['id'], dto: D): Promise<void>;

	toggle(id: T['id']): Promise<void>;

}