/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServer } from 'app';
import request from 'supertest';
import { Application } from 'express';
import { PrismaClient } from '@prisma/client';
import { createLogger } from 'util/logger';
import { ENDPOINTS } from 'config/constants';
import { returnDataFormat } from 'routesData/auth.data';

const prisma = new PrismaClient();
const server: Application = createServer();

const testRegisterData = {
  firstname: 'logger',
  surname: 'inooo',
  email: 'loguser@logs.testing.com',
  'external-id': '100917345',
  password: 'thisShouldntBeLogged.1',
};

let registerReturnData: returnDataFormat = {
  refresh: undefined,
  access: undefined,
};

const getLogs = () => {
  return new Promise((resolve, reject) => {
    const fromTime = new Date(parseInt(new Date().toString()) - 10 * 1000);
    const options = {
      from: fromTime,
      until: new Date(),
      limit: 150,
      start: 0,
      fields: ['message', 'meta'],
    };

    const logger = createLogger();
    logger.query(options, function (err, results) {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};
// TODO: clean up code, it's not my finest but it was a pain to get working!
describe(`Testing logs system`, () => {
  /**
   * Create logs in the system to test on!
   */
  beforeAll(async () => {
    await request(server)
      .post(ENDPOINTS.register)
      .set('Accept', 'application/json')
      .send(testRegisterData)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        registerReturnData = res.body;
      });
    await request(server)
      .post(ENDPOINTS.refreshAccess)
      .set('Accept', 'application/json')
      .send({ refresh: registerReturnData.refresh })
      .expect('Content-type', /json/)
      .expect(200)
      .expect((res) => expect(res.body).toHaveProperty('access'));

    await request(server)
      .post(ENDPOINTS.login)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .send({ email: 'loguser69@logs.testing.com' })
      .expect({
        error: 'Request is missing parts of the body.',
        missing: ['password'],
      })
      .expect(400);
  });

  afterAll(() => {
    return prisma.users.deleteMany({
      where: {
        email: {
          endsWith: '@logs.testing.com',
        },
      },
    });
  });

  test('Logs should be made about a register request', (done: jest.DoneCallback) => {
    getLogs()
      .then((logs: any) => {
        if (logs.dailyRotateFile.length != 0) {
          // not a pretty filter, but it gets the job done.
          const filtered = logs.dailyRotateFile.filter((log: any) => {
            if (log.message != ENDPOINTS.register) return false;
            if (log.meta.status_code != 200) return false;
            if (!('data' in log.meta)) return false;
            if (!('email' in log.meta.data)) return false;
            if (typeof log.meta.data.email !== 'string') return false;
            return log.meta.data.email.endsWith('@logs.testing.com');
          });

          if (filtered.length > 0) {
            expect(filtered[0].meta.data).toMatchObject({
              firstname: 'logger',
              surname: 'inooo',
              email: 'loguser@logs.testing.com',
              'external-id': '100917345',
              password: '****',
            });
          } else {
            throw new Error('No logs found for register request');
          }
          done();
        } else {
          throw new Error('No logs were found from the last 10 seconds :(');
        }
      })
      .catch((err: any) => {
        console.error(err);
      });
  });

  test('Logs should be made about a failed login request', (done: jest.DoneCallback) => {
    getLogs()
      .then((logs: any) => {
        if (logs.dailyRotateFile.length != 0) {
          const filtered = logs.dailyRotateFile.filter((log: any) => {
            if (log.message != ENDPOINTS.login) return false;
            if (log.meta.status_code != 400) return false;
            if (!('data' in log.meta)) return false;
            if (!('email' in log.meta.data)) return false;
            if (typeof log.meta.data.email !== 'string') return false;
            return log.meta.data.email.endsWith('@logs.testing.com');
          });

          if (filtered.length > 0) {
            expect(filtered[0].meta.data).toMatchObject({
              email: 'loguser69@logs.testing.com',
            });
          } else {
            throw new Error('No logs found for failed login');
          }

          done();
        } else {
          throw new Error('No logs were found from the last 10 seconds :(');
        }
      })
      .catch((err: any) => {
        console.error(err);
      });
  });

  test('Refresh tokens should not be logged', (done: jest.DoneCallback) => {
    getLogs()
      .then((logs: any) => {
        if (logs.dailyRotateFile.length != 0) {
          const filtered = logs.dailyRotateFile.filter((log: any) => {
            if (log.message != ENDPOINTS.refreshAccess) return false;
            if (log.meta.status_code != 200) return false;
            if (!('data' in log.meta)) return false;
            if (!('refresh' in log.meta.data)) return false;
            return true;
          });

          if (filtered.length > 0) {
            for (const refreshRequest of filtered) {
              expect(refreshRequest.meta.data).toMatchObject({
                refresh: '****',
              });
            }
          } else {
            throw new Error('No logs found for failed login');
          }

          done();
        } else {
          throw new Error('No logs were found from the last 10 seconds :(');
        }
      })
      .catch((err: any) => {
        console.error(err);
      });
  });
});
