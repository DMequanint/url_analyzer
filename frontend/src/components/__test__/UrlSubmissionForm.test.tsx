/*
  UrlSubmissionForm.test.tsx

  Unit tests for the UrlSubmissionForm component.

  Covered scenarios:
  - Proper rendering of input and button
  - Valid URL submission and success message
  - URL format validation
  - Duplicate prevention via `existingUrls` prop
*/

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UrlSubmissionForm from '../UrlSubmissionForm';

describe('UrlSubmissionForm', () => {
  test('renders input field and button', () => {
    render(<UrlSubmissionForm onSubmit={jest.fn()} />);

    expect(
      screen.getByPlaceholderText(/enter a url/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /analyze/i })
    ).toBeInTheDocument();
  });

  test('validates and submits a proper URL', async () => {
    const submitHandler = jest.fn(() => Promise.resolve());

    render(
      <UrlSubmissionForm
        onSubmit={submitHandler}
        existingUrls={[]}
      />
    );

    const input = screen.getByPlaceholderText(/enter a url/i);
    fireEvent.change(input, { target: { value: 'https://example.com' } });

    fireEvent.click(
      screen.getByRole('button', { name: /analyze/i })
    );

    await waitFor(() =>
      expect(submitHandler).toHaveBeenCalledWith('https://example.com')
    );

    expect(
      screen.getByText(/url submitted successfully/i)
    ).toBeInTheDocument();
  });

  test('shows error on invalid URL', () => {
    render(
      <UrlSubmissionForm onSubmit={jest.fn()} existingUrls={[]} />
    );

    const input = screen.getByPlaceholderText(/enter a url/i);
    fireEvent.change(input, { target: { value: 'bad-url' } });
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

    expect(
      screen.getByText(/please enter a valid url/i)
    ).toBeInTheDocument();
  });

  test('shows error on duplicate URL', () => {
    render(
      <UrlSubmissionForm
        onSubmit={jest.fn()}
        existingUrls={['https://exists.com']}
      />
    );

    const input = screen.getByPlaceholderText(/enter a url/i);
    fireEvent.change(input, { target: { value: 'https://exists.com' } });
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

    expect(
      screen.getByText(/already been analyzed/i)
    ).toBeInTheDocument();
  });
});

