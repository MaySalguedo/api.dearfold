import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';

async function bootstrap() {

	const app = await NestFactory.create(AppModule);
	dotenv.config();

	app.use((_req: Request, res: Response, next: NextFunction) => {

		res.header('Content-Type', 'application/json; charset=utf-8');
		next();

	});

	app.useGlobalPipes(new ValidationPipe({

		whitelist: true,			
		forbidNonWhitelisted: true,	
		transform: true,

	}));

	app.enableCors({

		origin: 'http://localhost:5173', 

	});

	await app.listen(3000);

}

bootstrap();