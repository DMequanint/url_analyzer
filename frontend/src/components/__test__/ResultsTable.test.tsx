/*
  ResultsTable.test.tsx

  Unit tests for the ResultsTable component.

  Test Objectives:
  - Ensure a row is properly rendered with mock URL data
  - Ensure that the "View" button triggers the onRowClick callback
*/

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultsTable from '../ResultsTable';
import { UrlData } from '../../types/url';

// Minimal test fixture
const mockData: UrlData[] = [
  {
    id: '1',
    url: 'https://example.com',
    normalized_url: 'https://example.com',
    pageTitle: 'Example Site',
    htmlVersion: 'HTML5',
    internalLinks: 5,
    externalLinks: 2,
    inaccessibleLinks: 1,
    hasLoginForm: false,
    status: 'done',
    h1: 1, h2: 2, h3: 0, h4: 0, h5: 0, h6: 0,
  },
];

describe('ResultsTable', () => {
  test('renders a row with URL data', () => {
    render(<ResultsTable data={mockData} />);

    expect(screen.getByText(/example site/i)).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/example.com/)).toBeInTheDocument();
  });

  test('calls onRowClick when "View" button is clicked', () => {
    const handleRowClick = jest.fn();
    render(<ResultsTable data={mockData} onRowClick={handleRowClick} />);

    fireEvent.click(screen.getByRole('button', { name: /view/i }));

    expect(handleRowClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1' })
    );
  });
});

