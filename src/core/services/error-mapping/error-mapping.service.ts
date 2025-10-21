import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable() export class ErrorMappingService implements OnModuleInit {

	private errorMap: Map<string, string> = new Map();

	public contructor() {}

	public async onModuleInit(): Promise<void> {

		await this.loadErrorMessages();

	}

	private async loadErrorMessages(): Promise<void> {

		try{

			const errorFilePath = path.join(process.cwd(), 'assets', `error-messages.json`);

			if (fs.existsSync(errorFilePath)){

				const messagesJson = fs.readFileSync(errorFilePath, 'utf8');
				const messages = JSON.parse(messagesJson);
				Object.entries(messages).forEach(([code, message]) => {

					this.errorMap.set(code, message as string);

				});

			}

		}catch(e: any){

			throw new NotFoundException('Error while finding error-mapping.json');

		}

	}

	public getMessage(code: string, originalMessage?: string): string {

		const messageTemplate = this.errorMap.get(code);

		if (!messageTemplate) {

			return originalMessage || 'Unkwown error';

		}

		if (originalMessage){

			const paramsString = originalMessage.trim();
			const params = paramsString.split(',').map(p => p.trim());

			return this.formatMessage(messageTemplate, params);

		}

		return messageTemplate;

	}

	private formatMessage(template: string, params: string[]): string {

		return params.reduce((msg, param, index) => {

			return msg.replace(`{${index}}`, param);

		}, template);

	}

}