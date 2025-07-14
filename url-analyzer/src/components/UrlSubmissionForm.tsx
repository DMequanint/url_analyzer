import React, { useState } from 'react';

interface UrlSubmissionFormProps {
  onSubmit: (url: string) => void;
}

const UrlSubmissionForm: React.FC<UrlSubmissionFormProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
      setUrl('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="Enter website URL"
        required
        style={{ width: '300px', marginRight: '8px' }}
      />
      <button type="submit">Analyze</button>
    </form>
  );
};

export default UrlSubmissionForm;

