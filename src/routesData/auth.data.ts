export interface valueDatatype {
  key: string;
  datatype: string;
  value: string | undefined;
  actualDatatype: unknown;
  regex: RegExp;
}

export interface userWithRole {
  id: string;
  external_id: string | null;
  firstname: string;
  surname: string;
  pronouns: string | null;
  email: string;
  profile_picture: string | null;
  password: string;
  salt: string;
  creation_time: Date;
  edit_time: Date;
  role_users: {
    roles: {
      id: string;
      name: string;
      overrides: number;
    };
  }[] | null;
}

export type userType = 'STUDENT' | 'STAFF' | 'ADMIN';

export type returnDataFormat = {
  access: string | undefined;
  refresh: string | undefined;
  roles?: {
    name: string;
    overrides: number;
  }[] | null;
};

const nameRegex = new RegExp(/^[a-zA-Z,.'-]{1,50}$/i);
const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})){1,150}$/);

export const registerRequiredBodyTemplate: valueDatatype[] = [
  {
    key: 'firstname',
    datatype: 'string',
    value: undefined,
    actualDatatype: undefined,
    regex: nameRegex,
  },
  {
    key: 'surname',
    datatype: 'string',
    value: undefined,
    actualDatatype: undefined,
    regex: nameRegex,
  },
  {
    key: 'email',
    datatype: 'string',
    value: undefined,
    actualDatatype: undefined,
    regex: emailRegex,
  },
  {
    key: 'password',
    datatype: 'string',
    value: undefined,
    actualDatatype: undefined,
    regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,40}$/,
    // password requires minimum 8 characters with 1 number and one letter
  },
  {
    key: 'external-id',
    datatype: 'string',
    value: undefined,
    actualDatatype: undefined,
    regex: /1009\d{5}/,
  },
];

export const loginRequiredBodyTemplate: valueDatatype[] = [
  {
    key: 'email',
    datatype: 'string',
    value: undefined,
    actualDatatype: undefined,
    regex: emailRegex,
  },
  {
    key: 'password',
    datatype: 'string',
    value: undefined,
    actualDatatype: undefined,
    regex: /.*/,
    // password requires minimum 8 characters with 1 number and one letter
  },
];

export const refreshRequiredBodyTemplate: valueDatatype[] = [
  {
    key: 'refresh',
    datatype: 'string',
    value: undefined,
    actualDatatype: undefined,
    regex: /.*/,
  },
];
/**
 * credits for the name regex https://stackoverflow.com/a/2385967/5758415
 * credits to http://emailregex.com/ for the email regex
 */
