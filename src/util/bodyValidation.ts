import { Request, Response, NextFunction } from "express";
import {
  valueDatatype,
} from "routesData/auth.data";
import {
  getMissingBodyError,
  getWrongDataTypeError,
  getInvalidDatatypeError,
} from "config/messages";

/**
 * Creates a string array of missing fields
 *
 * @param neededKeys keys that are required for the body
 * @returns {String[]} The missing fields
 */
export const createMissingBody = (neededKeys: valueDatatype[]): string[] => {
  const missingBody: string[] = [];
  neededKeys.forEach((item) => {
    if (typeof item.value === "undefined") {
      missingBody.push(item.key);
    }
  });

  return missingBody;
};

/**
 * This is used to create a good error message, telling the client what the wrong datatype they provided was.
 *
 * @param neededKeys
 * @returns the object containing the items with the wrong datatypes
 */
export const createWrongDatatypeBody = (
  neededKeys: valueDatatype[]
): valueDatatype[] => {
  const wrongDatatypeBody: valueDatatype[] = neededKeys.filter(
    (key) => key.datatype != key.actualDatatype
  );

  return wrongDatatypeBody;
};

/**
 * Generates a random string, used for password stalting
 *
 * @param size The size of the random string to be generated
 * @returns {String} the random string
 */
export const randomString = (size: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const characterLength: number = characters.length;
  let out = "";
  for (let i = 0; i < size; i++) {
    out += characters.charAt(Math.floor(Math.random() * characterLength));
  }
  return out;
};

/**
 * This validates the input strings, checking the length and the format against the regex
 *
 * @param data the data from the client
 * @returns {String} A list of invalid input fields
 */
const dataContentValidator = (data: valueDatatype[]): Array<string> => {
  const output: Array<string> = [];

  for (const entry of data) {
    if (entry.datatype === "string" && entry.value) {
      if (!entry.regex.test(entry.value)) {
        output.push(`${entry.key} is not a valid input`);
      }
    }
  }
  return output;
};

/**
 * This is a middleware validation method to veryify all data is present and valid when signing up
 */
export const bodyDataValidation = (body: valueDatatype[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requiredBody: valueDatatype[] = body.map((item) => {
      return {
        key: item.key,
        datatype: item.datatype,
        value: req.body[item.key],
        actualDatatype: typeof req.body[item.key],
        regex: item.regex,
      };
    });

    const bodyValidation: valueDatatype[] =
      createWrongDatatypeBody(requiredBody);
    const missingBody = 
      createMissingBody(bodyValidation);


    const dataValidity = dataContentValidator(requiredBody);

    if (missingBody.length != 0) {
      return res.status(400).send(getMissingBodyError(missingBody));
    } else if (bodyValidation.length != 0) {
      return res.status(400).send(getWrongDataTypeError(bodyValidation));
    } else if (dataValidity.length != 0) {
      return res.status(400).send(getInvalidDatatypeError(dataValidity));
    } else {
      next();
    }
  }
};
