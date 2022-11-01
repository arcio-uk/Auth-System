import { createServer } from "app";
import request from "supertest";
import { Application } from "express";
import { PrismaClient } from "@prisma/client";
import { ENDPOINTS } from "config/constants";

const prisma = new PrismaClient();
const server: Application = createServer();

const testLoginData = {
  firstname: "James",
  surname: "Arnot",
  email: "james@login.authtest.com",
  password: "HelloWorld1",
  "external-id": "100912345",
};

describe(`Testing login system`, () => {
  beforeAll((done) => {
    request(server)
      .post(ENDPOINTS.register)
      .set("Accept", "application/json")
      .send(testLoginData)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(() => done());
  });

  afterAll(() => {
    return prisma.users.deleteMany({
      where: {
        email: {
          endsWith: "@login.authtest.com",
          mode: 'insensitive'
        },
      },
    });
  });

  test("Empty request should 400 error", (done: jest.DoneCallback) => {
    request(server)
      .post(ENDPOINTS.login)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect({
        error: "Request is missing parts of the body.",
        missing: ["email", "password"],
      })
      .expect(400, done);
  });

  test("Valid request should give 200 response", (done: jest.DoneCallback) => {
    request(server)
      .post(ENDPOINTS.login)
      .set("Accept", "application/json")
      .send({
        email: testLoginData.email,
        password: testLoginData.password,
      })
      .expect((res) => {
        expect(res.body).toHaveProperty("access");
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(done);
  });

  test("Wrong password should return 403 error", (done: jest.DoneCallback) => {
    request(server)
      .post(ENDPOINTS.login)
      .set("Accept", "application/json")
      .send({
        email: testLoginData.email,
        password: "WrongPassword123.....",
      })
      .expect({ error: "Credentials are incorrect" })
      .expect("Content-Type", /json/)
      .expect(403)
      .end(done);
  });

  test("Invalid credentials should give a 403 error", (done: jest.DoneCallback) => {
    request(server)
      .post(ENDPOINTS.login)
      .set("Accept", "application/json")
      .send({
        email: "Jhooon@login.authtest.com",
        password: "ILoveBigJuicyCockerels123",
      })
      .expect("Content-Type", /json/)
      .expect({ error: "Credentials are incorrect" })
      .expect(403, done);
  });
});
