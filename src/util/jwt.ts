import fs from 'fs';
import jwt from 'jsonwebtoken';
import { publicKeyPath, privateKeyPath } from 'config/env';
import { users } from '@prisma/client';
import { userWithRole } from 'routesData/auth.data';

//Read key pair from .env paths.
const privateKey = fs.readFileSync(__dirname + "/../../" + privateKeyPath);
const publicKey = fs.readFileSync(__dirname + "/../../" + publicKeyPath);

export interface jwtToken {
  token?: token;
  error?: string;
}

/**
 * JWT Type.
 */
type jwtType = 'ACCESS' | 'REFRESH';

export interface token {
  firstname: string;
  surname: string;
  uuid: string;
  type: jwtType;
  iat: number;
  exp: number;
}

/**
 * Function to sign and generate jwt, for user authentication.
 *
 * @param user user object created by prisma.
 * @param type type of jwt defined in type above @see jwtType
 * @returns jwt as a string.
 */
export const generateJwt = (user: userWithRole | users, type: jwtType): string => {
  let expiryDate = 0;
  if (type === 'ACCESS') {
    expiryDate = Math.floor(new Date().getTime() + (5 * 60 * 1000) / 1000);
  } else {
    expiryDate = Math.floor(new Date().getTime() + (14 * 24 * 60 * 60 * 1000) / 1000);
  }

  return jwt.sign(
    {
      firstname: user.firstname,
      surname: user.surname,
      uuid: user.id,
      type: type,
    },
    privateKey,
    { 
      algorithm: 'ES512',
      expiresIn: expiryDate,
    }
  );
};


/**
 * Wrapper function to verify JWTs.
 *
 * TODO: Check JWT body against DB user.
 *
 * @param token string of jwt to be verified.
 * @returns the jwt payload or an error.
 */
export const verifyJwt = (token: string): jwtToken => {
  try {
    const verified: token = <token>jwt.verify(token, publicKey);
    return { token: verified };
  } catch (error: any) {
    return { error: 'Token is invalid' };
  }
};
