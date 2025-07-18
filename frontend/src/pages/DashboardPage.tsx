import React, { useEffect, useState } from "react";
import axios from "axios";
import UrlSubmissionForm from "../components/UrlSubmissionForm";
import ResultsTable from "../components/ResultsTable";
import Modal from "../components/Modal";
import UrlDetailView from "../components/UrlDetailView";
import { UrlData, UrlDetailData } from "../types/url";
import "./DashboardPage.css";

const DashboardPage: React.FC = () => {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<UrlDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUrls = async () => {
    try {
      const res = await axios.get("/api/urls");
      setUrls(res.data);
    } catch (err) {
      console.error("Failed to fetch URLs", err);
    }
  };

  useEffect(() => {
    fetchUrls();
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setUrls((prev) => {
        if (update.status === "deleted") {
          return prev.filter((url) => url.id !== update.id);
        }

        const i = prev.findIndex((url) => url.id === update.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], ...update };
          return next;
        }

        return [update, ...prev];
      });
    };

    return () => ws.close();
  }, []);

  const handleSubmitUrl = async (url: string) => {
    try {
      await axios.post("/api/urls", { url });
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Could not add URL.");
    }
  };

  const handleAnalyze = async (id: string) => {
    await axios.post(`/api/urls/${id}/analyze`);
    setUrls((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "queued" } : u))
    );
  };

  const handleRetry = async (id: string) => {
    await axios.post(`/api/urls/${id}/retry`);
    setUrls((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "queued" } : u))
    );
  };

  const handleBulkAnalyze = async (ids: string[]) => {
    await Promise.all(ids.map((id) => axios.post(`/api/urls/${id}/analyze`)));
  };

  const handleBulkDelete = async (ids: string[]) => {
    await Promise.all(ids.map((id) => axios.delete(`/api/urls/${id}`)));
    setUrls((prev) => prev.filter((u) => !ids.includes(u.id)));
  };

  const handleRowClick = async (url: UrlData) => {
    try {
      const res = await axios.get(`/api/urls/${url.id}`);
      setSelectedUrl(res.data);
    } catch {
      console.error("Failed to load detail view");
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">URL Analyzer Dashboard</h1>
      <UrlSubmissionForm
        onSubmit={handleSubmitUrl}
        existingUrls={urls.map((u) => u.normalized_url)}
        disabled={false}
        error={error}
      />

      <ResultsTable
        data={urls}
        onRetry={handleRetry}
        onStartAnalyze={handleAnalyze}
        onBulkAnalyze={handleBulkAnalyze}
        onBulkDelete={handleBulkDelete}
        onRowClick={handleRowClick}
      />

      <Modal
        isOpen={!!selectedUrl}
        onClose={() => setSelectedUrl(null)}
        title="Page Details"
      >
        {selectedUrl && <UrlDetailView url={selectedUrl} />}
      </Modal>
    </div>
  );
};

export default DashboardPage;

