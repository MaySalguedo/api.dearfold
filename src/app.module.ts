import { Module } from '@nestjs/common';

import { CoreModule } from './core/core.module';
import { AuthModule } from './endpoints/auth/auth.module';
import { UserModule } from './endpoints/user/user.module';

@Module({

	imports: [

		CoreModule, AuthModule, UserModule

	], exports: [

		

	], controllers: [

		

	], providers: [

		

	]
 
}) export class AppModule {}