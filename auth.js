import axios from 'axios';
import CONFIG from './config';

// Login function that checks against MongoDB
export const login = async (formData) => {
  try {
    // Call your API endpoint that checks credentials in MongoDB
    const response = await axios.post(CONFIG.API.LOGIN, formData);
    
    if (response.data.success) {
      localStorage.setItem('isLoggedIn', 'true');
      return { success: true, message: 'Login successful' };
    } else {
      return { success: false, message: response.data.message || 'Invalid credentials' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed. Please try again.' };
  }
};

// Check if user is logged in
export const isLoggedIn = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

// Log out function
export const logout = () => {
  localStorage.removeItem('isLoggedIn');
};
