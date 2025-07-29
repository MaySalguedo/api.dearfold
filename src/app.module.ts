import { Module } from '@nestjs/common';
import { AuthModule } from './endpoints/auth/auth.module';
import { UserModule } from './endpoints/user/user.module';
import { CoreModule } from './core/core.module';

@Module({

	imports: [

		CoreModule, AuthModule, UserModule

	], exports: [

		

	], controllers: [

		

	], providers: [

		

	]
 
}) export class AppModule {}