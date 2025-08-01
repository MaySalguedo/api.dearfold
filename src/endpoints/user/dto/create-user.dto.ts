import { IsString, IsNotEmpty, IsUrl, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { User } from '@user/entities/user.entity';
import { Dto } from '@models/dto.model';

export class CreateUserDto extends Dto<User> {

	@IsString() @IsNotEmpty() @MinLength(3, {

		message: 'Name is too short. Minimal length is $constraint1 characters.'

	}) @MaxLength(20, {

		message: 'Name is too long. Maximun length is $constraint1 characters.'

	}) public name: string;

	@IsString() @IsOptional() @MaxLength(1000, {

		message: 'Picture url is too long. Maximun length is $constraint1 characters.'

	}) @IsUrl({

		require_protocol: false,
		require_tld: false

	}) public picture?: string;

	@IsBoolean() @IsOptional() public admin?: boolean;

}