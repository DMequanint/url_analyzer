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

  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

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
      setValue("");
      setInputError(null);
      setSuccessMessage("✅ URL submitted successfully.");
    } catch (err) {
      setInputError("❌ Failed to submit URL.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="url-form" onSubmit={handleSubmit} autoComplete="off">
      <div className="form-row">
        <label htmlFor="url-input" className="visually-hidden">
          Website URL
        </label>
        <div className="input-container">
          <input
            id="url-input"
            type="url"
            name="url"
            className="url-input"
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

