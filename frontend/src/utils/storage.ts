import api from './api';
import type { TestResult, Question } from '../types';

const HISTORY_KEY = 'cea_exam_history'; // Fallback for offline

// Save result to backend (and localStorage as fallback)
export const saveTestResult = async (result: TestResult): Promise<void> => {
  try {
    await api.post('/api/results', result);
  } catch {
    // Fallback to localStorage if not logged in or offline
    const history = getLocalHistory();
    history.push(result);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
};

// Get results from backend
export const getTestHistory = async (): Promise<TestResult[]> => {
  try {
    const { data } = await api.get('/api/results');
    return data;
  } catch {
    // Fallback to localStorage
    return getLocalHistory();
  }
};

// Clear all results
export const clearTestHistory = async (): Promise<void> => {
  try {
    await api.delete('/api/results');
  } catch {
    localStorage.removeItem(HISTORY_KEY);
  }
};

// Local history helpers
const getLocalHistory = (): TestResult[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Get questions from backend
export const getQuestionsBySubject = async (subject: string): Promise<Question[]> => {
  try {
    const { data } = await api.get(`/api/questions/${encodeURIComponent(subject)}`);
    return data;
  } catch (e) {
    console.error('Failed to load questions for subject', subject, e);
    return [];
  }
};

export const getAllQuestionsRaw = async (subject: string): Promise<Question[]> => {
  try {
    const { data } = await api.get(`/api/questions/${encodeURIComponent(subject)}?all=true`);
    return data;
  } catch {
    return [];
  }
};
