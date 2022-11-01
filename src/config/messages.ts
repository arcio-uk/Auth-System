import { valueDatatype } from "routesData/auth.data";

export const getMissingBodyError = (missing: string[]) => {
  return { error: "Request is missing parts of the body.", missing: missing };
};

export const getEmailError = () => {
  return { error: "Email has already been registered." };
};

export const getDatabaseError = () => {
  return { error: "An unexpected database error occured." };
};

export const getWrongDataTypeError = (wrongItems: valueDatatype[]) => {
  const wrongItemsString: string[] = wrongItems.map((item) => item.key);
  return {
    error: "The following items were of the wrong datatype",
    items: wrongItemsString,
  };
};

export const getInvalidDatatypeError = (err: Array<string>) => {
  const msg =
    err.length == 1
      ? "There has been a validation error with the following item."
      : "There have been validation errors with the following items.";
  return { error: msg, items: err };
};

export const getCredentialsError = () => {
  return { error: "Credentials are incorrect" };
};

export const getInvalidUserError = () => {
  return { error: "User does not exist." };
};

export const getInvalidPasswordError = () => {
  return { error: "Invalid password." };
};

export const getInvalidJwtMessage = (type: string) => {
  return { error: "The following token was invalid", token: type };
};

export const getExpiredJwtMessage = (type: string) => {
  return { error: "The following token was expired", token: type };
};
