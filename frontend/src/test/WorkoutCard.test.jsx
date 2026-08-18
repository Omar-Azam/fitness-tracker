import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WorkoutCard from '../components/WorkoutCard';

describe('WorkoutCard Component', () => {
  const mockWorkout = {
    _id: 'mock_workout_123',
    name: 'Upper Body Power',
    category: 'strength',
    date: '2026-08-18T00:00:00.000Z',
    duration: 65,
    tags: ['chest', 'back', 'hypertrophy'],
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: 6, weight: 90 },
      { name: 'Bent Over Barbell Row', sets: 4, reps: 8, weight: 80 },
    ],
  };

  it('renders workout details correctly', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <WorkoutCard
        workout={mockWorkout}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    // Verify workout name and category badge
    expect(screen.getByText('Upper Body Power')).toBeInTheDocument();
    expect(screen.getByText(/strength/i)).toBeInTheDocument();

    // Verify duration and exercise count
    expect(screen.getByText(/65 mins/i)).toBeInTheDocument();
    expect(screen.getByText(/2 exercises/i)).toBeInTheDocument();

    // Verify tags
    expect(screen.getByText('chest')).toBeInTheDocument();
    expect(screen.getByText('back')).toBeInTheDocument();
    expect(screen.getByText('hypertrophy')).toBeInTheDocument();

    // Expand accordion to check exercises
    const accordionBtn = screen.getByRole('button', { name: /exercise breakdown/i });
    fireEvent.click(accordionBtn);
    expect(screen.getByText('Barbell Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Bent Over Barbell Row')).toBeInTheDocument();
  });

  it('triggers onEdit and onDelete callbacks when buttons are clicked', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <WorkoutCard
        workout={mockWorkout}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    const editBtn = screen.getByTitle('Edit workout');
    const deleteBtn = screen.getByTitle('Delete workout');

    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleEdit).toHaveBeenCalledWith(mockWorkout);

    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith(mockWorkout);
  });
});
