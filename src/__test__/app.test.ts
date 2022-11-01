import { createServer } from 'app';
import request from 'supertest';
import { Application } from 'express';
import { ENDPOINTS } from 'config/constants';

const server: Application = createServer();

describe(`GET ${ENDPOINTS.status}`, () => {
  test('GET Request', (done: jest.DoneCallback) => {
    request(server).get(ENDPOINTS.status).expect('Content-Type', /json/).expect(200, done);
  });
});
