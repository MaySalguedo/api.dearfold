import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable() export class HeaderMiddleware implements NestMiddleware {

	public use(req: Request, res: Response, next: NextFunction) {

		const tranform = req.headers['transform'];

		const detail: Array<string> = [];

		if (tranform) if (tranform!=='true' && tranform!=='false') detail.push(

			'transform header parameter must be boolean'

		);

		if (detail.length!=0) throw new BadRequestException(detail);

		next();

	}

}