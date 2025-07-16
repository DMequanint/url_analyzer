/*
  ResultsTable.tsx

  A dynamic, interactive table component for displaying analyzed URLs.

  Features:
  - Global search
  - Sortable columns
  - Pagination
  - Row and bulk selection (analyze / delete)
  - Inline row actions: retry, view, re-analyze
*/

import React, { useEffect, useMemo, useState } from "react";
import { UrlData } from "../types/url";
import "./ResultsTable.css";

interface ResultsTableProps {
  data: UrlData[];
  onRetry?: (id: string) => void;
  onStartAnalyze?: (id: string) => void;
  onBulkAnalyze?: (ids: string[]) => void;
  onBulkDelete?: (ids: string[]) => void;
  onRowClick?: (row: UrlData) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  onRetry,
  onStartAnalyze,
  onBulkAnalyze,
  onBulkDelete,
  onRowClick,
}) => {
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>("pageTitle");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  /*
    Cleanup selection state if table data is updated
    (e.g., filtered, removed)
  */
  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (data.some((d) => d.id === id)) next.add(id);
      });
      return next;
    });
  }, [data]);

  const toggleCheckbox = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isSelected = (id: string) => selectedIds.has(id);
  const selectedArray = Array.from(selectedIds);

  const statusMap: Record<string, string> = {
    queued: "Queued",
    running: "Running",
    done: "Done",
    error: "Error",
  };

  /*
    Filter and sort data based on global search and chosen column
  */
  const filteredAndSortedData = useMemo(() => {
    const lowerSearch = globalSearch.trim().toLowerCase();

    const searched = data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lowerSearch)
      )
    );

    const sorted = [...searched].sort((a, b) => {
      const aVal = String(a[sortColumn as keyof UrlData] ?? "").toLowerCase();
      const bVal = String(b[sortColumn as keyof UrlData] ?? "").toLowerCase();
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

    return sorted;
  }, [data, globalSearch, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="table-wrap">
      {/* Search input field */}
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Search..."
          value={globalSearch}
          onChange={(e) => {
            setGlobalSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{ padding: "6px", width: "250px" }}
        />
      </div>

      {/* Bulk actions on selected rows */}
      {selectedArray.length > 0 && (
        <div className="bulk-actions">
          <button onClick={() => onBulkAnalyze?.(selectedArray)}>
            Re-run selected
          </button>
          <button onClick={() => onBulkDelete?.(selectedArray)}>
            Delete selected
          </button>
        </div>
      )}

      <table className="results-table">
        <thead>
          <tr>
            <th></th>
            <th onClick={() => handleSort("pageTitle")}>Page Title</th>
            <th onClick={() => handleSort("htmlVersion")}>HTML Version</th>
            <th>Headings</th>
            <th onClick={() => handleSort("internalLinks")}>Internal</th>
            <th onClick={() => handleSort("externalLinks")}>External</th>
            <th onClick={() => handleSort("inaccessibleLinks")}>Broken</th>
            <th onClick={() => handleSort("hasLoginForm")}>Login Form</th>
            <th onClick={() => handleSort("status")}>Status</th>
            <th>URL</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={11} style={{ textAlign: "center" }}>
                No data found.
              </td>
            </tr>
          ) : (
            paginatedData.map((row) => (
              <tr key={row.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected(row.id)}
                    onChange={() => toggleCheckbox(row.id)}
                  />
                </td>
                <td>{row.pageTitle || "(no title)"}</td>
                <td>{row.htmlVersion || "N/A"}</td>
                <td>
                  {["h1", "h2", "h3", "h4", "h5", "h6"]
                    .map((h) => {
                      const count = row[h as keyof UrlData];
                      return typeof count === "number" && count > 0
                        ? `${h.toUpperCase()}: ${count}`
                        : null;
                    })
                    .filter(Boolean)
                    .join(", ") || "-"}
                </td>
                <td>{row.internalLinks}</td>
                <td>{row.externalLinks}</td>
                <td>{row.inaccessibleLinks}</td>
                <td>{row.hasLoginForm ? "Yes" : "No"}</td>
                <td>{statusMap[row.status] || row.status}</td>
                <td>
                  <a href={row.url} target="_blank" rel="noopener noreferrer">
                    {row.url}
                  </a>
                </td>
                <td>
                  <div className="action-buttons">
                    {["queued", "done", "error"].includes(row.status) && (
                      <button onClick={() => onStartAnalyze?.(row.id)}>
                        {row.status === "done" ? "Re-run" : "Start"}
                      </button>
                    )}
                    {row.status === "error" && (
                      <button onClick={() => onRetry?.(row.id)}>Retry</button>
                    )}
                    <button onClick={() => onRowClick?.(row)}>View</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="pagination-controls" style={{ marginTop: 10 }}>
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
          {"<<"}
        </button>
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          {"<"}
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          {">"}
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          {">>"}
        </button>
      </div>
    </div>
  );
};

export default ResultsTable;

