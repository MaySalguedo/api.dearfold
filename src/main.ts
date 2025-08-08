import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {

	dotenv.config();

	const app = await NestFactory.create(AppModule);

	app.use(cookieParser());

	app.use((_req: Request, res: Response, next: NextFunction) => {

		res.header('Content-Type', 'application/json; charset=utf-8');
		next();

	});

	app.useGlobalPipes(new ValidationPipe({

		whitelist: true,			
		forbidNonWhitelisted: true,	
		transform: true,

	}));

	const allowedOrigins = [

		'http://localhost:5173',
		'http://localhost:8100',
		'http://localhost:8080',
		'capacitor://localhost',
		'http://localhost'

	];

	app.enableCors({

		origin: (origin, callback) => {

			if (!origin) return callback(null, true);
			
			if (allowedOrigins.includes(origin) || origin.includes('http://localhost:') ||	origin.includes('ionic://')) {

				return callback(null, true);

			}
			
			callback(new Error('Origen no permitido por CORS'));
		}, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
		allowedHeaders: 'Content-Type, Authorization, X-Requested-With'

	});

	await app.listen(3000);

}

bootstrap();