/*
  UrlDetailView.tsx

  A detail view component that shows analysis results for a single URL.

  Displays:
  - Pie chart comparing internal vs. external links (via Recharts)
  - Table of broken links (if available)

  Props:
  - url: an object containing link counts and optional broken links details
*/

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { UrlDetailData, LinkDetail } from '../types/url';

const COLORS = ['#4caf50', '#f44336']; // Green (internal), Red (external)

const UrlDetailView: React.FC<{ url: UrlDetailData }> = ({ url }) => {
  const chartData = [
    { name: 'Internal Links', value: url.internalLinks },
    { name: 'External Links', value: url.externalLinks },
  ];

  const brokenLinks: LinkDetail[] = url.brokenLinksDetails || [];

  return (
    <div style={{ padding: 8 }}>
      <h3>Link Breakdown</h3>

      {/* Pie chart showing ratio of internal and external links */}
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Broken links list */}
      <div style={{ marginTop: 24 }}>
        <h4>Broken Links</h4>

        {brokenLinks.length === 0 ? (
          <p>No broken links found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>URL</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {brokenLinks.map((link, index) => (
                <tr key={index}>
                  <td style={{ padding: 8 }}>{link.url}</td>
                  <td style={{ padding: 8 }}>{link.status}</td>
                  <td style={{ padding: 8 }}>{link.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UrlDetailView;

