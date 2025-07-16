import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { fetchUrlDetails } from '../services/api'; // You need to implement this

interface LinkDetail {
  url: string;
  status: number;
}

interface UrlDetailData {
  id: string;
  url: string;
  description: string;
  htmlVersion: string;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: LinkDetail[];
  hasLoginForm: boolean;
  // Add other fields as needed
}

const COLORS = ['#0088FE', '#FF8042'];

const DetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<UrlDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchUrlDetails(id)
        .then((res) => setData(res))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Not found.</div>;

  const chartData = [
    { name: 'Internal Links', value: data.internalLinks },
    { name: 'External Links', value: data.externalLinks },
  ];

  return (
    <div>
      <Link to="/">&larr; Back to Dashboard</Link>
      <h2>Details for: {data.url}</h2>
      <p><strong>Description:</strong> {data.description}</p>
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
      <div style={{ marginTop: '24px' }}>
        <PieChart width={300} height={200}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={60}
            fill="#8884d8"
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
};

export default DetailsPage;

