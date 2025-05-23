// client/src/api/exercises.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getExercises = async (filters = {}) => {
  const { muscleGroup, category, search } = filters;
  const params = {};

  if (muscleGroup && muscleGroup !== 'All') params.muscleGroup = muscleGroup;
  if (category && category !== 'All') params.category = category;
  if (search) params.search = search;

  const response = await axios.get(`${API_URL}/exercises`, { params });
  return response.data;
};

export const createExercise = async (exerciseData) => {
  const response = await axios.post(`${API_URL}/exercises`, exerciseData);
  return response.data;
};

export const updateExercise = async (id, exerciseData) => {
  const response = await axios.put(`${API_URL}/exercises/${id}`, exerciseData);
  return response.data;
};

export const deleteExercise = async (id) => {
  const response = await axios.delete(`${API_URL}/exercises/${id}`);
  return response.data;
};

export const importExercises = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const searchExercisesWithAI = async (searchTerm) => {
  const response = await axios.post(`${API_URL}/ai-search`, { searchTerm });
  return response.data;
};

export const getStats = async () => {
  const response = await axios.get(`${API_URL}/stats`);
  return response.data;
};