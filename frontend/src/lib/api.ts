import axios from 'axios';

// Base URL for our FastAPI backend
// In production (Vercel), this environment variable will be set.
// In development (Docker), we fallback to internal docker DNS or localhost.
const API_URL = process.env.NEXT_PUBLIC_API_URL || (
  typeof window === 'undefined' 
    ? 'http://backend:8000' 
    : 'http://localhost:8000'
);
// Define the structure of the Call object (matching our Python Schema!)
export interface Call {
  id: number;
  filename: string;
  upload_timestamp: string;
  transcript: string;
  analysis_json: {
    summary?: string;
    speaker_roles?: string[];
    sentiment_score?: number;
    sentiment_label?: string;
    intent?: string;
    key_insights?: string[];
  };
  tags: string[];
  custom_tags: string[];
  metadata_json: Record<string, any>;
}

// API Helper Functions
export const api = {
  // 1. Upload File
  uploadCall: async (file: File) => {
    // Create Form Data
    const formData = new FormData();
    // Append the file
    formData.append('file', file);
    // Send POST Request to the backend
    const response = await axios.post<Call>(`${API_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 2. Get All Calls
  getCalls: async (tag?: string) => {
    try {
      const params = tag ? { tag } : {};
      const response = await axios.get<Call[]>(`${API_URL}/calls`, { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch calls:", error);
      // Return empty list if backend is unreachable (e.g. during build)
      return [];
    }
  },

  // 3. Get Single Call
  getCall: async (id: number) => {
    const response = await axios.get<Call>(`${API_URL}/calls/${id}`);
    return response.data;
  },

  // 4. Update Tags
  updateTags: async (id: number, tags: string[]) => {
    const response = await axios.patch<Call>(`${API_URL}/calls/${id}/tags`, {
      custom_tags: tags,
    });
    return response.data;
  },

  // 5. Analytics
  getAnalytics: async () => {
    const response = await axios.get(`${API_URL}/analytics`);
    return response.data;
  },
  
  // Helper for Download Link
  exportUrl: (id: number) => `${API_URL}/calls/${id}/export`
};

