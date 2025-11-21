import axios from 'axios';

// Base URL for our FastAPI backend
const API_URL = 'http://localhost:8000';

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
    const params = tag ? { tag } : {};
    const response = await axios.get<Call[]>(`${API_URL}/calls`, { params });
    return response.data;
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

