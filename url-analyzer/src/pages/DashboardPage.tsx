import React, { useEffect, useState } from 'react';
import UrlSubmissionForm from '../components/UrlSubmissionForm';
import ResultsTable from '../components/ResultsTable';
import { submitUrl, fetchUrls } from '../services/api';

interface UrlData {
  id: string;
  url: string;
  title: string;
  htmlVersion: string;
  internalLinks: number;
  externalLinks: number;
  status: string;
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
      <ResultsTable data={urls} />
    </div>
  );
};

export default DashboardPage;

