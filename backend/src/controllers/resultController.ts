import { Request, Response } from 'express';
import TestResult from '../models/TestResult';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// GET /api/results  — get logged-in user's results
export const getResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const results = await TestResult.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/results  — save a new test result
export const saveResult = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const resultData = req.body;

    const result = new TestResult({
      userId,
      ...resultData,
    });

    await result.save();
    res.status(201).json({ message: 'Result saved', id: result._id });
  } catch (error) {
    console.error('Save result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/results  — clear all results for logged-in user
export const clearResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    await TestResult.deleteMany({ userId });
    res.json({ message: 'All results cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
