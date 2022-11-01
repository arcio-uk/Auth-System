import express, { Request, Response, Router } from "express";
import {
  getEmailError,
  getInvalidUserError,
  getInvalidJwtMessage,
  getExpiredJwtMessage,
  getCredentialsError
} from "config/messages";
import { randomString, bodyDataValidation } from "util/bodyValidation";
import { sha512 } from "js-sha512";
import { PASSWORD_SALT_LENGTH, ENDPOINTS } from "config/constants";
import { PrismaClient, users } from "@prisma/client";
import { generateJwt, verifyJwt, jwtToken, token } from "util/jwt";
import {
  registerRequiredBodyTemplate,
  loginRequiredBodyTemplate,
  refreshRequiredBodyTemplate,
  returnDataFormat,
  userWithRole,
} from "routesData/auth.data";
import crypto from "crypto";

const prisma = new PrismaClient();
const authRouter: Router = express.Router();

authRouter.post(
  ENDPOINTS.register,
  bodyDataValidation(registerRequiredBodyTemplate),
  async (req: Request, res: Response) => {
    const passwordSalt: string = randomString(PASSWORD_SALT_LENGTH);
    const passwordHash: string = sha512(req.body.password + passwordSalt);

    try {
      const createNewUser: users = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          external_id: req.body["student-id"],
          firstname: req.body.firstname,
          surname: req.body.surname,
          pronouns: "they/them",
          email: req.body.email,
          password: passwordHash,
          salt: passwordSalt,
          creation_time: new Date(),
          edit_time: new Date(),
        },
      });

      // setting permissions to 0 as the user has just been created
      const returnData: returnDataFormat = {
        refresh: generateJwt(createNewUser, "REFRESH"),
        access: generateJwt(createNewUser, "ACCESS"),
      };

      res.status(200).send(returnData);
      return;
    } catch (error) {
      console.error("Error with registering a new user: "+error);
      res.status(400).send(getEmailError());
      return;
    }
  }
);

authRouter.post(
  ENDPOINTS.login,
  bodyDataValidation(loginRequiredBodyTemplate),
  async (req: Request, res: Response) => {
    try {
      const foundUser: userWithRole | null = await prisma.users.findFirst({
        where: {
          email: {
            equals: req.body.email,
            mode: "insensitive",
          },
        },
        include: {
          role_users: {
            select: {
              roles: {
                select: {
                  id: true,
                  name: true,
                  overrides: true,
                }
              },
            }
          }
        }
      });

      if (!foundUser) {
        res.status(403).send(getCredentialsError());
        return;
      }

      const passwordHash: string = sha512(req.body.password + foundUser.salt);
      if (passwordHash !== foundUser.password) {
        res.status(403).send(getCredentialsError());
        return;
      }

      const returnData: returnDataFormat = {
        refresh: generateJwt(foundUser, "REFRESH"),
        access: generateJwt(foundUser, "ACCESS"),
        roles: foundUser.role_users?.map((roleUser) => ({...roleUser.roles})),
      };

      res.status(200).send(returnData);
      return;
    } catch (error) {
      console.error("Error with loggin user in: "+error);
      res.status(400).send(getEmailError());
      return;
    }
  }
);

authRouter.post(
  ENDPOINTS.refreshAccess,
  bodyDataValidation(refreshRequiredBodyTemplate),
  async (req: Request, res: Response) => {
    try {
      const refreshToken: jwtToken = verifyJwt(req.body.refresh);
      if (refreshToken.error != null) {
        res.status(400).send(getInvalidJwtMessage("refresh"));
        return;
      } else {
        if (refreshToken.token) {
          const refreshTokenObject: token = refreshToken.token;
          // TODO: modify this for the new expirary date
          if (refreshTokenObject.exp < (new Date().getTime() / 1000)) {
            res.status(400).send(getExpiredJwtMessage("refresh"));
            return;
          } else {
            const foundUser: users | null = await prisma.users.findUnique({
              where: {
                id: refreshTokenObject.uuid,
              },
            });

            if (foundUser == null) {
              res.status(403).send(getInvalidUserError());
            } else {
              res.status(200).send({
                access: generateJwt(foundUser, "ACCESS"),
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Access Token Refresh Error: "+error);
      res.status(400).send({ error: "Access token refresh error" });
      return;
    }
  }
);

export default authRouter;
