import * as dotenv from 'dotenv';

import { Secret } from 'jsonwebtoken';
dotenv.config();

if (!process.env.PORT) {
  throw new Error('PORT must be present in the .env file!');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be present in the .env file!');
}
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be present in the .env file!');
}

if (!process.env.PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY must be present in the .env file!');
}

if (!process.env.PUBLIC_KEY) {
  throw new Error('PUBLIC_KEY must be present in the .env file!');
}

export const jwtSecret: Secret = <Secret>process.env.JWT_SECRET;
export const publicKeyPath: string = process.env.PUBLIC_KEY;
export const privateKeyPath: string = process.env.PRIVATE_KEY;
