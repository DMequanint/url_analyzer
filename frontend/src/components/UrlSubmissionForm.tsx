/*
  UrlSubmissionForm.tsx

  A React component that renders a form for submitting URLs to be analyzed.

  Features:
  - Validates input (must start with http/https)
  - Prevents duplicates (if `existingUrls` is provided)
  - Shows in-form error and success messages
  - Calls `onSubmit()` callback with the cleaned URL
  - Displays accessibility-friendly labels and errors
*/

import React, { useState, useEffect } from "react";
import "./UrlSubmissionForm.css";

interface UrlSubmissionFormProps {
  onSubmit: (url: string) => Promise<void> | void;
  existingUrls?: string[];
  disabled?: boolean;
  error?: string | null;
}

const UrlSubmissionForm: React.FC<UrlSubmissionFormProps> = ({
  onSubmit,
  existingUrls = [],
  disabled,
  error,
}) => {
  const [value, setValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /* Clear success message after a delay */
  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => setSuccessMessage(null), 3500);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  /* Simple URL format and duplicate check */
  const validateUrl = (url: string) => {
    if (!/^https?:\/\/[^ "]+$/.test(url)) {
      return "Please enter a valid URL (starting with http or https)";
    }
    if (existingUrls.includes(url)) {
      return "This URL has already been analyzed.";
    }
    return null;
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setInputError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = value.trim();
    const err = validateUrl(trimmed);
    if (err) {
      setInputError(err);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(trimmed);
      setSuccessMessage("URL submitted successfully.");
      setValue("");
    } catch {
      setInputError("Failed to submit URL.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="url-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="url-input" className="visually-hidden">
          Website URL
        </label>
        <div className="url-input-wrapper">
          {/* Optional: replace icon with accessible text or SVG */}
          <span className="url-input-icon">🔗</span>
          <input
            id="url-input"
            className="url-input"
            type="url"
            name="url"
            placeholder="Enter a URL (https://example.com)"
            value={value}
            onChange={handleInput}
            disabled={disabled || submitting}
            aria-invalid={!!inputError}
            aria-describedby="url-error"
            required
          />
        </div>
        <button
          type="submit"
          className="url-btn"
          disabled={disabled || submitting || !value.trim()}
        >
          {submitting ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {inputError && (
        <div className="form-error" id="url-error">
          {inputError}
        </div>
      )}
      {!inputError && error && (
        <div className="form-error" id="url-error">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="form-success" role="status">
          {successMessage}
        </div>
      )}
    </form>
  );
};

export default UrlSubmissionForm;

