import request from 'supertest';
import { app } from '../../index';

const describeIfServerAllowed = process.env.JEST_ALLOW_SERVER === 'true' ? describe : describe.skip;

const uniqueEmail = () => `auth-int-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

describeIfServerAllowed('Auth Routes Integration', () => {
  it('registers, logs in, refreshes token, and updates profile', async () => {
    const email = uniqueEmail();
    const password = 'TestPass123!';

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password,
        firstName: 'Integration',
        lastName: 'Tester',
      })
      .expect(201);

    expect(registerResponse.body.success).toBe(true);
    const { accessToken, refreshToken } = registerResponse.body.data.tokens;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    expect(loginResponse.body.data.tokens.accessToken).toBeDefined();

    const refreshResponse = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken })
      .expect(200);

    expect(refreshResponse.body.data.tokens.accessToken).toBeDefined();

    const profileResponse = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(profileResponse.body.data.email).toBe(email);

    const updateResponse = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Updated' })
      .expect(200);

    expect(updateResponse.body.data.firstName).toBe('Updated');

    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('rejects login with invalid credentials', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'missing@example.com', password: 'invalid' })
      .expect(401);
  });
});
