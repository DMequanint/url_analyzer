import axios from "axios";

// Data type for a URL summary (used in list)
import { UrlData } from '../types/url';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8080";

// Data type for broken link details
export interface LinkDetail {
  url: string;
  status: number;
}

// Data type for detailed URL info (used in details page)
export interface UrlDetailData {
  id: string;
  url: string;
  description: string;
  htmlVersion: string;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: LinkDetail[];
  hasLoginForm: boolean;
  // Add other fields if needed
}

// Fetch all URLs (summary list)
export const fetchUrls = async (): Promise<UrlData[]> => {
  const response = await axios.get(API_BASE_URL);
  return response.data.map((item: any) => ({
    id: item.id,
    url: item.url,
    description: item.page_title || "",
    htmlVersion: item.html_version || "",
    internalLinks: item.internal_links_count ?? 0,
    externalLinks: item.external_links_count ?? 0,
    status: item.status,
    errorReason: item.error_reason || null,
  }));
};

// Submit a new URL to be analyzed
export const submitUrl = async (url: string) => {
  try {
    const response = await axios.post("http://127.0.0.1:8080/api/urls", { url });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
        throw new Error("This URL has already been analyzed.");
      } else if (error.response?.status === 400) {
        throw new Error("Invalid URL format. Please check and try again.");
      } else if (error.response) {
        throw new Error(`Request failed: ${error.response.statusText}`);
      } else {
        throw new Error("Network error. Please try again.");
      }
    } else {
      throw error;
    }
  }
};

// ✅ Fetch details for a single URL
export const fetchUrlDetails = async (id: string): Promise<UrlDetailData> => {
  const response = await axios.get(`http://127.0.0.1:8080/api/urls/${id}`);
  const item = response.data;
  return {
    id: item.id,
    url: item.url,
    description: item.page_title || "",
    htmlVersion: item.html_version || "",
    internalLinks: item.internal_links_count ?? 0,
    externalLinks: item.external_links_count ?? 0,
    brokenLinks: item.broken_links_details
      ? Object.entries(item.broken_links_details).map(([url, status]) => ({
          url,
          status: typeof status === "number" ? status : 0,
        }))
      : [],
    hasLoginForm: !!item.has_login_form,
    // You can add more fields from API as needed
  };
};

