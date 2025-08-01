import { IsString, IsNotEmpty, IsEmail, IsUrl, IsOptional, IsBoolean, MinLength, MaxLength, IsNumber } from 'class-validator';
import { Auth } from '@auth/entities/auth.entity';
import { Dto } from '@models/dto.model';

export class CreateAuthDto extends Dto<Auth> {

	@IsString() @IsNotEmpty() @MaxLength(100, {

		message: 'Email is too long. Maximun length is $constraint1 characters.'

	}) public email: string;

	@IsString() @IsNotEmpty() @MaxLength(16, {

		message: 'Password is too long. Maximun length is $constraint1 characters.'

	}) public password: string;

}