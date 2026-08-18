import request from 'supertest';
import app from '../server.js';
import './setup.js';

describe('Workouts Integration Tests (/api/workouts)', () => {
  let user1Token;
  let user2Token;

  const registerUser = async (username, email) => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username,
        email,
        password: 'Password123!',
        name: 'Test User',
      });
    return res.body.token;
  };

  beforeEach(async () => {
    user1Token = await registerUser('user1_workout', 'user1_workout@test.com');
    user2Token = await registerUser('user2_workout', 'user2_workout@test.com');
  });

  describe('POST /api/workouts', () => {
    it('should create a new workout for authenticated user', async () => {
      const workoutPayload = {
        name: 'Chest & Triceps Hypertrophy',
        category: 'strength',
        tags: ['chest', 'push'],
        duration: 60,
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: 8, weight: 80, notes: 'Felt strong' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 28 },
        ],
      };

      const res = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(workoutPayload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('workout');
      expect(res.body.workout.name).toBe(workoutPayload.name);
      expect(res.body.workout.category).toBe('strength');
      expect(res.body.workout.exercises.length).toBe(2);
      expect(res.body.workout.exercises[0].name).toBe('Barbell Bench Press');
    });

    it('should reject workout creation if required name is missing', async () => {
      const res = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ category: 'strength' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name is required/i);
    });
  });

  describe('GET /api/workouts (Filtering & Listing)', () => {
    beforeEach(async () => {
      // Create a strength workout
      await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Heavy Squats & Legs',
          category: 'strength',
          tags: ['legs', 'quads'],
          duration: 50,
          exercises: [{ name: 'Back Squat', sets: 5, reps: 5, weight: 120 }],
        });

      // Create a cardio workout
      await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Morning Interval Run',
          category: 'cardio',
          tags: ['running'],
          duration: 30,
          exercises: [{ name: 'Treadmill Sprints', sets: 6, reps: 1, weight: 0 }],
        });
    });

    it('should list all workouts belonging to the logged-in user', async () => {
      const res = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.workouts.length).toBe(2);
      expect(res.body.totalWorkouts).toBe(2);
    });

    it('should filter workouts by category query param', async () => {
      const res = await request(app)
        .get('/api/workouts?category=cardio')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.workouts.length).toBe(1);
      expect(res.body.workouts[0].name).toBe('Morning Interval Run');
      expect(res.body.workouts[0].category).toBe('cardio');
    });
  });

  describe('PUT & DELETE /api/workouts/:id', () => {
    let workoutId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Original Workout',
          category: 'strength',
          duration: 45,
          exercises: [{ name: 'Pull-ups', sets: 3, reps: 10, weight: 0 }],
        });
      workoutId = res.body.workout._id;
    });

    it('should update an existing workout', async () => {
      const res = await request(app)
        .put(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Updated Workout Title',
          duration: 55,
        });

      expect(res.status).toBe(200);
      expect(res.body.workout.name).toBe('Updated Workout Title');
      expect(res.body.workout.duration).toBe(55);
    });

    it('should delete an existing workout', async () => {
      const res = await request(app)
        .delete(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);

      // Verify it no longer exists
      const checkRes = await request(app)
        .get(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(checkRes.status).toBe(404);
    });
  });

  describe('Multi-Tenant Data Isolation', () => {
    let user1WorkoutId;

    beforeEach(async () => {
      // User 1 creates a private workout
      const res = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: "User 1's Secret Workout",
          category: 'strength',
          exercises: [{ name: 'Deadlift', sets: 3, reps: 5, weight: 160 }],
        });
      user1WorkoutId = res.body.workout._id;
    });

    it("should prevent User 2 from viewing User 1's workout by ID (404)", async () => {
      const res = await request(app)
        .get(`/api/workouts/${user1WorkoutId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/workout not found/i);
    });

    it("should prevent User 2 from updating User 1's workout (404)", async () => {
      const res = await request(app)
        .put(`/api/workouts/${user1WorkoutId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ name: 'Hacked Title' });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/workout not found/i);
    });

    it("should prevent User 2 from deleting User 1's workout (404)", async () => {
      const res = await request(app)
        .delete(`/api/workouts/${user1WorkoutId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/workout not found/i);
    });

    it("should return empty list when User 2 lists workouts", async () => {
      const res = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(200);
      expect(res.body.workouts.length).toBe(0);
      expect(res.body.totalWorkouts).toBe(0);
    });
  });
});
