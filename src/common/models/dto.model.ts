import { IsBoolean, IsOptional } from 'class-validator';

export class Dto{

	@IsBoolean() @IsOptional() public state?: boolean;

}