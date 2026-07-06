import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('AIChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the chat toggle button', () => {
    render(<AIChat />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens chat window when toggle button is clicked', async () => {
    render(<AIChat />);
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByText('LuxuryStay Assistant')).toBeInTheDocument();
    });
  });

  it('displays welcome message on open', async () => {
    render(<AIChat />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText(/Hello! Welcome to LuxuryStay/)).toBeInTheDocument();
    });
  });

  it('shows quick question buttons initially', async () => {
    render(<AIChat />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Recommend a hotel')).toBeInTheDocument();
      expect(screen.getByText('What rooms are available?')).toBeInTheDocument();
    });
  });

  it('sends message and displays bot response', async () => {
    const mockResponse = {
      data: { response: 'We have luxury suites available!' },
    };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    render(<AIChat />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ask me anything...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.change(input, { target: { value: 'Do you have rooms?' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('We have luxury suites available!')).toBeInTheDocument();
    });

    expect(api.post).toHaveBeenCalledWith('/ai/chat', { message: 'Do you have rooms?' });
  });

  it('displays error message when API call fails', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    render(<AIChat />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ask me anything...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/having trouble connecting/)).toBeInTheDocument();
    });
  });

  it('closes chat window when close button is clicked', async () => {
    render(<AIChat />);
    const openButton = screen.getByRole('button');
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.getByText('LuxuryStay Assistant')).toBeInTheDocument();
    });

    const closeButton = screen.getAllByRole('button')[0];
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('LuxuryStay Assistant')).not.toBeInTheDocument();
    });
  });
});
