import { User } from '@user/entities/user.entity';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { IQuery } from '@interfaces/query/query.interface';

export interface IUser<U extends User = User, D extends CreateUserDto = CreateUserDto> extends IQuery<U> {

	update(id: U['id'], dto: D): Promise<void>;

}