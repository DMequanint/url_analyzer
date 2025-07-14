import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface LinkDetail {
  url: string;
  status: number;
}

interface UrlDetailData {
  id: string;
  url: string;
  title: string;
  htmlVersion: string;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: LinkDetail[];
  hasLoginForm: boolean;
  // Add other fields as needed
}

const DetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<UrlDetailData | null>(null);

  useEffect(() => {
    // TODO: Replace with real API call
    // fetchUrlDetails(id).then(setData);
    // For now, use mock data:
    setData({
      id: id || '',
      url: 'https://example.com',
      title: 'Example Site',
      htmlVersion: 'HTML5',
      internalLinks: 12,
      externalLinks: 8,
      brokenLinks: [
        { url: 'https://example.com/broken1', status: 404 },
        { url: 'https://example.com/broken2', status: 500 },
      ],
      hasLoginForm: true,
    });
  }, [id]);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2>Details for: {data.url}</h2>
      <p><strong>Title:</strong> {data.title}</p>
      <p><strong>HTML Version:</strong> {data.htmlVersion}</p>
      <p><strong>Internal Links:</strong> {data.internalLinks}</p>
      <p><strong>External Links:</strong> {data.externalLinks}</p>
      <p><strong>Login Form Present:</strong> {data.hasLoginForm ? 'Yes' : 'No'}</p>
      <h3>Broken Links</h3>
      <ul>
        {data.brokenLinks.map((link, idx) => (
          <li key={idx}>{link.url} — Status: {link.status}</li>
        ))}
      </ul>
      {/* Placeholder for future chart */}
      <div style={{ marginTop: '24px' }}>
        <strong>[Chart of Internal vs. External Links will go here]</strong>
      </div>
    </div>
  );
};

export default DetailsPage;

