import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AIChat from '../components/ui/AIChat';

// Mock scrollIntoView for JSDOM
Element.prototype.scrollIntoView = vi.fn();

// Mock the API client
vi.mock('../api/client', () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from '../api/client';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('AIChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the chat toggle button', () => {
    renderWithRouter(<AIChat />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens chat window when toggle button is clicked', async () => {
    renderWithRouter(<AIChat />);
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByText('LuxuryStay Agent')).toBeInTheDocument();
    });
  });

  it('displays welcome message on open', async () => {
    renderWithRouter(<AIChat />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText(/Hello! Welcome to LuxuryStay/)).toBeInTheDocument();
    });
  });

  it('shows quick question buttons initially', async () => {
    renderWithRouter(<AIChat />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Book a hotel in Dubai')).toBeInTheDocument();
      expect(screen.getByText('What rooms are available in Paris?')).toBeInTheDocument();
    });
  });

  it('sends message and displays bot response', async () => {
    const mockResponse = {
      data: { content: 'We have luxury suites available!' },
    };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    renderWithRouter(<AIChat />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ask me to book a hotel...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Ask me to book a hotel...');
    fireEvent.change(input, { target: { value: 'Do you have rooms?' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('We have luxury suites available!')).toBeInTheDocument();
    });

    expect(api.post).toHaveBeenCalledWith(
      '/v1/ai/chat',
      expect.objectContaining({
        sessionId: expect.any(String),
        userMessage: 'Do you have rooms?',
      })
    );
  });

  it('displays error message when API call fails', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    renderWithRouter(<AIChat />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ask me to book a hotel...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Ask me to book a hotel...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/having trouble connecting/)).toBeInTheDocument();
    });
  });

  it('closes chat window when close button is clicked', async () => {
    renderWithRouter(<AIChat />);
    const openButton = screen.getByRole('button');
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.getByText('LuxuryStay Agent')).toBeInTheDocument();
    });

    const closeButton = screen.getAllByRole('button')[0]!;
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('LuxuryStay Agent')).not.toBeInTheDocument();
    });
  });
});
