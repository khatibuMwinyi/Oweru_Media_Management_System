import axios from "axios";
import { API_BASE_URL } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post("/register", data),
  login: (data) => api.post("/login", data),
  logout: () => api.post("/logout"),
  getUser: () => api.get("/user"),
};

export const postService = {
  getAll: (params = {}) => api.get("/posts", { params }),
  getById: (id) => api.get(`/posts/${id}`),
  getByCategory: (category, params = {}) =>
    api.get(`/posts/category/${category}`, { params }),
  create: (data) => {
    const formData = new FormData();
    formData.append("category", data.category);
    formData.append("post_type", data.post_type);
    formData.append("title", data.title);
    formData.append("description", data.description);

    if (data.metadata) {
      formData.append("metadata", JSON.stringify(data.metadata));
    }

    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append("images[]", image);
      });
    }

    if (data.video) {
      formData.append("video", data.video);
    }

    return api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  approve: (id, moderation_note) =>
    api.post(`/posts/${id}/approve`, { moderation_note }),
  reject: (id, moderation_note) =>
    api.post(`/posts/${id}/reject`, { moderation_note }),
};

export const aiService = {
  generate: (data) => api.post("/ai/generate", data),
  improve: (data) => api.post("/ai/improve", data),
  getSuggestions: (category) => api.get(`/ai/suggestions/${category}`),
};

export const mediaService = {
  upload: (file, postId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (postId) {
      formData.append("post_id", postId);
    }
    return api.post("/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  delete: (id) => api.delete(`/media/${id}`),
};

export default api;
