/* eslint-disable @typescript-eslint/no-explicit-any */

import winston from 'winston';
import { Request, Response } from 'express';
import { NON_LOGGED_KEYS } from 'config/constants';
import  DailyRotateFile from 'winston-daily-rotate-file';


export const createLog = async (req: Request, res: Response, logger: winston.Logger) => {
	res.on('finish', () => {
		switch(res.statusCode) {
			case 200:
				logger.log({
					level: 'http',
					message: req.path,
					meta: {
						status_code: res.statusCode,
						data: req.body,
					},
				})
				break;
			default:
				logger.log({
					level: 'error',
					message: req.path,
					meta: {
						status_code: res.statusCode,
						data: req.body,
					},
				});
				break;
		}
	});
};

export const createLogger = () => {

	return winston.createLogger({
		level: 'info',
		defaultMeta: { service: 'auth-system' },
		format: winston.format.combine(
			censorPasswords(),
			winston.format.timestamp(),
			winston.format.json(),
		),
		transports: [
			/**
			 * Used to rotate the logs so one file does not get too big.
			 */
			new DailyRotateFile({
				dirname: process.env.LOG_DIR,
				filename: process.env.ROTATING_LOG_FILE_NAME,
				auditFile: process.env.AUDIT_FILE_NAME,
				datePattern: 'YYYY-MM-DD',
				zippedArchive: true,
				maxSize: '20m',
				maxFiles: process.env.LOG_EXPIRY_TIME,
				json: true,
				level: 'http',
			}),
		],
	});
};

/**
 * @param obj The object to search through
 * @returns An object with censored passwords!
 */
 const recursivePasswordCensor: any = (obj: any) => {
	const keysToRemove = Object.keys(obj).filter(key => key == NON_LOGGED_KEYS.find((k: string) => k == key));
	for(const k of keysToRemove){
		obj[k] = '****';
	}	
	for(const el of Object.keys(obj)){
		if(typeof obj[el] === 'object'){
			obj[el] = recursivePasswordCensor(obj[el]);
		}
	}
	return obj;
};

/**
 * Called whenever a log has been created, checks to see if it's an object, which could contain a password
 */
const censorPasswords = winston.format((info: any) => {
	if(typeof info === 'object'){
		info = recursivePasswordCensor(info);
	}
  return info;
});