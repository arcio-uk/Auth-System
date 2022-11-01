import { PrismaClient } from '@prisma/client';
import { createServer } from 'app';
import { Application } from 'express';
import { returnDataFormat } from 'routesData/auth.data';
import request from 'supertest';
import { ENDPOINTS } from 'config/constants';

const prisma = new PrismaClient();
const server: Application = createServer();

const testRegisterData = {
  firstname: 'James',
  surname: 'Arnot',
  email: 'refreshtoken@accesstoken.testing.com',
  password: 'HelloWorld1',
  'external-id': '100912345',
};

let registerReturnData: returnDataFormat = {
  refresh: undefined,
  access: undefined,
};

describe('Testing Refresh Access Token endpoint', () => {
  beforeAll((done) => {
    request(server)
      .post(ENDPOINTS.register)
      .set('Accept', 'application/json')
      .send(testRegisterData)
      .expect('Content-type', /json/)
      .expect(200)
      .then((res) => {
        registerReturnData = res.body;
        done();
      });
  });

  afterAll(() => {
    return prisma.users.deleteMany({
      where: {
        email: {
          contains: '@accesstoken.testing.com',
        },
      },
    });
  });

  test('Empty request should 400 error', (done: jest.DoneCallback) => {
    request(server)
      .post(ENDPOINTS.refreshAccess)
      .set('Accept', 'application/json')
      .expect('Content-type', /json/)
      .expect({ error: 'Request is missing parts of the body.', missing: ['refresh'] })
      .expect(400)
      .end(done);
  });

  test('Erronous refresh token should return 400 error', (done: jest.DoneCallback) => {
    request(server)
      .post(ENDPOINTS.refreshAccess)
      .set('Accept', 'application/json')
      .send({ refresh: 'ey2321321dsadsa.dsadsadsadsa.dsadsadsa' })
      .expect('Content-type', /json/)
      .expect({ error: 'The following token was invalid', token: 'refresh' })
      .expect(400)
      .end(done);
  });

  test('Refresh Access token with valid refresh token returns 200 and new access token', (done: jest.DoneCallback) => {
    request(server)
      .post(ENDPOINTS.refreshAccess)
      .set('Accept', 'application/json')
      .send({ refresh: registerReturnData.refresh })
      .expect('Content-type', /json/)
      .expect((res) => expect(res.body).toHaveProperty('access'))
      .expect(200)
      .end(done);
  });
});
