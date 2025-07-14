import React, { useEffect, useState } from 'react';
import UrlSubmissionForm from '../components/UrlSubmissionForm';
import { submitUrl, fetchUrls } from '../services/api';

interface UrlData {
  id: string;
  url: string;
  status: string;
  // Add other relevant fields as needed
}

const DashboardPage: React.FC = () => {
  const [urls, setUrls] = useState<UrlData[]>([]);

  const loadUrls = async () => {
    const data = await fetchUrls();
    setUrls(data);
  };

  useEffect(() => {
    loadUrls();
  }, []);

  const handleSubmit = async (url: string) => {
    await submitUrl(url);
    loadUrls();
  };

  return (
    <div>
      <h1>Website Analyzer Dashboard</h1>
      <UrlSubmissionForm onSubmit={handleSubmit} />
      <ul>
        {urls.map(item => (
          <li key={item.id}>
            {item.url} — {item.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardPage;

