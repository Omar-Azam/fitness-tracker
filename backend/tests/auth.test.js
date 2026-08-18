import request from 'supertest';
import app from '../server.js';
import './setup.js';

describe('Auth Integration Tests (/api/auth)', () => {
  const testUser = {
    username: 'fitnesstester',
    email: 'tester@example.com',
    password: 'Password123!',
    name: 'Fitness Tester',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return a JWT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toBe(testUser.username.toLowerCase());
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user.password).toBeUndefined();
    });

    it('should reject registration if email is already taken', async () => {
      // First registration
      await request(app).post('/api/auth/register').send(testUser);

      // Duplicate registration attempt
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          username: 'different_user',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/email already exists/i);
    });

    it('should reject registration if password is shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'shortpassuser',
          email: 'shortpass@example.com',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/at least 8 characters/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login successfully with valid email and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          emailOrUsername: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toBe(testUser.username.toLowerCase());
      expect(res.body.user.password).toBeUndefined();
    });

    it('should login successfully with valid username and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          emailOrUsername: testUser.username,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          emailOrUsername: testUser.email,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid/i);
    });

    it('should reject login for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          emailOrUsername: 'nonexistent@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid/i);
    });
  });

  describe('GET /api/auth/me (Protected Route)', () => {
    let authToken;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      authToken = res.body.token;
    });

    it('should return the logged-in user profile when valid token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toBe(testUser.username.toLowerCase());
      expect(res.body.user.password).toBeUndefined();
    });

    it('should return 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/no token|not authorized/i);
    });

    it('should return 401 when token is invalid or malformed', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.payload');

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalid|expired/i);
    });
  });
});
