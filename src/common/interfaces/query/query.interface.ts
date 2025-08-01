import { Entity } from '@models/entity.model';

export interface IQuery<T extends Entity<unknown>> {

	findOne(id: T['id']): Promise<T | null>;

	findAll(): Promise<Array<T>>;

}