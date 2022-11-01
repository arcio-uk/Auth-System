import { createServer } from 'app';
import request from 'supertest';
import { Application } from 'express';
import { PrismaClient } from '@prisma/client';
import { jwtToken, token, verifyJwt } from 'util/jwt';
import { ENDPOINTS } from 'config/constants';

const prisma = new PrismaClient();
const server: Application = createServer();

beforeAll(() => {
  return prisma.users.deleteMany({
    where: {
      email: {
        contains: 'register.authtest.com',
      },
    },
  });
});

afterAll(() => {
  return prisma.users.deleteMany({
    where: {
      email: {
        contains: 'register.authtest.com',
      },
    },
  });
});

describe('POST Register User', () => {
  test('Empty request should 400 error', (done: jest.DoneCallback) => {
    request(server)
      .post(ENDPOINTS.register)
      .expect('Content-Type', /json/)
      .expect({
        error: 'Request is missing parts of the body.',
        missing: ['firstname', 'surname', 'email', 'password', 'external-id'],
      })
      .expect(400, done);
  });

  test('Request with missing parts should return 400 error', (done: jest.DoneCallback) => {
    request(server)
      .post(ENDPOINTS.register)
      .set('Accept', 'application/json')
      .send({ surname: 'Costa', password: 'HelloWorld' })
      .expect('Content-Type', /json/)
      .expect({
        error: 'Request is missing parts of the body.',
        missing: ['firstname', 'email', 'external-id'],
      })
      .expect(400, done);
  });

  test('Request with valid data should return 200', (done: jest.DoneCallback) => {
    request(server)
      .post(ENDPOINTS.register)
      .set('Accept', 'application/json')
      .send({
        firstname: 'John',
        surname: 'Costa',
        email: 'john@register.authtest.com',
        password: 'HelloWorld1',
        'external-id': '100912345',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((response) => {
        const accessToken: jwtToken = verifyJwt(response.body.access);
        const refreshToken: jwtToken = verifyJwt(response.body.refresh);

        expect(accessToken.error).toBe(undefined);
        expect(refreshToken.error).toBe(undefined);

        const accessTokenObject: token = <token>accessToken.token;
        const refreshTokenObject: token = <token>refreshToken.token;

        expect(accessTokenObject.firstname).toBe('John');
        expect(accessTokenObject.surname).toBe('Costa');
        expect(typeof accessTokenObject.uuid).toBe('string');
        expect(typeof accessTokenObject.iat).toBe('number');
        expect(typeof accessTokenObject.exp).toBe('number');
        expect(accessTokenObject.type).toBe('ACCESS');

        expect(refreshTokenObject.firstname).toBe('John');
        expect(refreshTokenObject.surname).toBe('Costa');
        expect(typeof refreshTokenObject.uuid).toBe('string');
        expect(typeof refreshTokenObject.iat).toBe('number');
        expect(typeof refreshTokenObject.exp).toBe('number');
        expect(refreshTokenObject.type).toBe('REFRESH');
      })
      .end(done);
  });

  test('Request with valid data in different order should return 200', (done: jest.DoneCallback) => {
    request(server)
      .post(ENDPOINTS.register)
      .set('Accept', 'application/json')
      .send({
        surname: 'Costa',
        email: 'john2@register.authtest.com',
        firstname: 'John',
        password: 'HelloWorld1',
        'external-id': '100912345',
      })
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  test('Request with duplicate data should return 400', (done: jest.DoneCallback) => {
    request(server)
      .post(ENDPOINTS.register)
      .set('Accept', 'application/json')
      .send({
        firstname: 'John',
        surname: 'Costa',
        email: 'john@register.authtest.com',
        password: 'HelloWorld1',
        'external-id': '100912345',
      })
      .expect('Content-Type', /json/)
      .expect({
        error: 'Email has already been registered.',
      })
      .expect(400, done);
  });

  test('Request with wrong datatypes should return 400', (done: jest.DoneCallback) => {
    request(server)
      .post(ENDPOINTS.register)
      .set('Accept', 'application/json')
      .send({
        firstname: 5,
        surname: 'Costa',
        email: 3.2,
        password: [],
        'external-id': '100912345',
      })
      .expect('Content-Type', /json/)
      .expect({
        error: 'The following items were of the wrong datatype',
        items: ['firstname', 'email', 'password'],
      })
      .expect(400, done);
  });

  test('Request with data that is more than the maximum allowed length should return 400', (done: jest.DoneCallback) => {
    let bigString = '';
    for (let i = 0; i < 100; i++) {
      bigString += '😩😩😩😩😩';
    }
    request(server)
      .post(ENDPOINTS.register)
      .set('Accept', 'application/json')
      .send({
        firstname: 'john',
        surname: 'doe',
        email: 'john@register.authtest.com',
        password: bigString,
        'external-id': '100912345',
      })
      .expect('Content-Type', /json/)
      .expect({
        error: 'There has been a validation error with the following item.',
        items: ['password is not a valid input'],
      })
      .expect(400, done);
  });

  test('Request with data that is more than the maximum allowed length should return 400', (done: jest.DoneCallback) => {
    let bigString = '';
    for (let i = 0; i < 100; i++) {
      bigString += '😩😩😩😩😩';
    }
    request(server)
      .post(ENDPOINTS.register)
      .set('Accept', 'application/json')
      .send({
        firstname: bigString,
        surname: bigString,
        email: 'x@register.authtest.com',
        password: bigString,
        'external-id': '100912345',
      })
      .expect('Content-Type', /json/)
      .expect({
        error: 'There have been validation errors with the following items.',
        items: [
          'firstname is not a valid input',
          'surname is not a valid input',
          'password is not a valid input',
        ],
      })
      .expect(400, done);
  });

  describe('Register user ready for re-registering test', () => {
    test('Request with valid data should return 200', (done: jest.DoneCallback) => {
      request(server)
        .post(ENDPOINTS.register)
        .set('Accept', 'application/json')
        .send({
          firstname: 'John',
          surname: 'Costa',
          email: 'reregister@register.authtest.com',
          password: 'HelloWorld1',
          'external-id': '100912345',
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          const accessToken: jwtToken = verifyJwt(response.body.access);
          const refreshToken: jwtToken = verifyJwt(response.body.refresh);

          expect(accessToken.error).toBe(undefined);
          expect(refreshToken.error).toBe(undefined);

          const accessTokenObject: token = <token>accessToken.token;
          const refreshTokenObject: token = <token>refreshToken.token;

          expect(accessTokenObject.firstname).toBe('John');
          expect(accessTokenObject.surname).toBe('Costa');
          expect(typeof accessTokenObject.uuid).toBe('string');
          expect(typeof accessTokenObject.iat).toBe('number');
          expect(typeof accessTokenObject.exp).toBe('number');
          expect(accessTokenObject.type).toBe('ACCESS');

          expect(refreshTokenObject.firstname).toBe('John');
          expect(refreshTokenObject.surname).toBe('Costa');
          expect(typeof refreshTokenObject.uuid).toBe('string');
          expect(typeof refreshTokenObject.iat).toBe('number');
          expect(typeof refreshTokenObject.exp).toBe('number');
          expect(refreshTokenObject.type).toBe('REFRESH');
        })
        .end(done);
    });
  });

  describe('Try to re-register user with same credentials', () => {
    test('Request with duplicate data should return 400', (done: jest.DoneCallback) => {
      request(server)
        .post(ENDPOINTS.register)
        .set('Accept', 'application/json')
        .send({
          firstname: 'John',
          surname: 'Costa',
          email: 'reregister@register.authtest.com',
          password: 'HelloWorld1',
          'external-id': '100912345',
        })
        .expect('Content-Type', /json/)
        .expect({
          error: 'Email has already been registered.',
        })
        .expect(400, done);
    });
  });
});
