import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TopFilms from './TopFilms';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('TopFilms Component', () => {
  it('fetches data and displays the movie list', async () => {
    // Mock successful API response
    const movies = [
      { title: 'Movie 1', release_date: '2023-01-01', box_office: 1000000 },
      { title: 'Movie 2', release_date: '2023-01-02', box_office: 2000000 },
    ];
    axios.get.mockResolvedValueOnce({ data: movies });

    render(<TopFilms />);

    // Check for loading state
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await waitFor(() => {
      // Check if movies are displayed
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Movie 2')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    // Mock API error
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    render(<TopFilms />);

    await waitFor(() => {
      // Check for error message
      expect(screen.getByText(/Error fetching data/i)).toBeInTheDocument();
    });
  });
});