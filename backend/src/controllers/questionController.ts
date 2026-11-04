import { Request, Response } from 'express';
import Question from '../models/Question';
import { AuthRequest } from '../middleware/auth';

// GET /api/questions/:subject
export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const subject = String(req.params.subject);
    const { all } = req.query; // ?all=true returns all including needs_review

    const filter: any = { subject: decodeURIComponent(subject) };
    if (all !== 'true') {
      filter.validationStatus = 'verified';
    }

    const questions = await Question.find(filter).lean();
    res.json(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/questions/subjects
export const getSubjects = async (_req: Request, res: Response): Promise<void> => {
  try {
    const subjects = await Question.distinct('subject');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/save-questions  (admin only)
export const saveQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, questions } = req.body;

    if (!subject || !Array.isArray(questions)) {
      res.status(400).json({ message: 'Subject and questions array required' });
      return;
    }

    // Replace all questions for this subject
    await Question.deleteMany({ subject });
    const docs = questions.map((q: any) => ({ ...q, subject }));
    await Question.insertMany(docs);

    res.json({ message: `Saved ${questions.length} questions for ${subject}` });
  } catch (error) {
    console.error('Save questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
