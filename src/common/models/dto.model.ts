import { Entity } from '@models/entity.model';
import { IsBoolean, IsOptional } from 'class-validator';

export class Dto<T extends Entity<unknown>>{

	@IsBoolean() @IsOptional() public state?: Entity['state'];

}