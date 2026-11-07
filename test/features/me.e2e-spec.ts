import { INestApplication } from '@nestjs/common';
import { DSL, createDSL } from '../dsl/dsl.factory';
import { response } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';
import { workflows } from '@test/dsl/workflows';

describe('Me (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('returns user data when authenticated', async () => {
      const jwtAccessToken = await dsl.users
        .createUser({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'password123',
        })
        .expect(201)
        .then((response) => response.body.jwtAccessToken);

      return dsl.users
        .authenticatedAs(jwtAccessToken)
        .me()
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            id: expect.any(String),
            name: 'Test User',
            email: 'testuser@example.com',
            role: null, // Role is unset for new users. They decide their role later (student or instructor)
            biography: null,
            interests: [],
            profilePictureUrl: null,
          });
        });
    });

    test('returns no tickets resolved for a support agent with no resolved tickets', async () => {
      const jwtAccessToken =
        await workflows(dsl).createUserWithRole('support_agent');

      await dsl.users
        .authenticatedAs(jwtAccessToken)
        .me()
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            resolvedTickets: 0,
          });
        });
    });

    test('returns tickets resolved for a support agent with 1 or more resolved ticket', async () => {
      const jwtAccessTokenUser =
        await workflows(dsl).createUserWithRole('student');

      const ticketOpenedByUser = await dsl.tickets
        .authenticatedAs(jwtAccessTokenUser)
        .create({
          title: 'Test Ticket',
          description: 'This is a test ticket',
        })
        .expect(201)
        .then((response) => response.body.id);

      const jwtAccessTokenAgent =
        await workflows(dsl).createUserWithRole('support_agent');

      await dsl.tickets
        .authenticatedAs(jwtAccessTokenAgent)
        .resolve(ticketOpenedByUser)
        .expect(200);

      await dsl.users
        .authenticatedAs(jwtAccessTokenAgent)
        .me()
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            resolvedTickets: 1,
          });
        });
    });
  });

  describe('error cases', () => {
    test('returns an error when request is not authenticated', () => {
      return dsl.users
        .me()
        .expect(401)
        .expect(
          response.unauthorized('Authorization header is missing or malformed'),
        );
    });

    test('returns an error when JWT is invalid', () => {
      return dsl.users
        .authenticatedAs('invalid.jwt.token')
        .me()
        .expect(401)
        .expect(response.unauthorized('Invalid JWT token'));
    });
  });
});
