import { Auth } from '@auth/entities/auth.entity';
import { Dto } from '@models/dto.model';

export interface IAuth<T extends Auth, D extends Dto<Auth>> {

	logup(dto: D): Promise<T['id']>;

	login(email: Auth['email'], password: Auth['password'], uuid?: string): Promise<string>;

	logout(token: string): Promise<void>;

}