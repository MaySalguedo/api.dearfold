import { Entity } from '@models/entity.model';

export type Attribute<T extends Entity> = {id: T['id']} | {state: T['state']};