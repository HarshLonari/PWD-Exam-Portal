import mongoose, { Schema, Document, Types } from 'mongoose';

interface TestSettings {
  subject: string;
  mode: 'Full Test' | 'Practice Test' | 'Custom Test';
  numberOfQuestions: number;
  durationMinutes: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  negativeMarking: boolean;
  negativeMarksPerWrongAnswer: number;
  unansweredZero: boolean;
}

interface AnswerRecord {
  questionId: string;
  selectedOptionIndex: number | null;
  status: string;
  originalOptionIndices: number[];
}

export interface ITestResult extends Document {
  userId: Types.ObjectId;
  date: string;
  settings: TestSettings;
  questions: any[];
  answers: Record<string, AnswerRecord>;
  totalQuestions: number;
  attempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  accuracy: number;
  timeTakenSeconds: number;
}

const TestResultSchema = new Schema<ITestResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true },
    settings: { type: Schema.Types.Mixed, required: true },
    questions: [{ type: Schema.Types.Mixed }],
    answers: { type: Schema.Types.Mixed, required: true },
    totalQuestions: { type: Number },
    attempted: { type: Number },
    correctAnswers: { type: Number },
    incorrectAnswers: { type: Number },
    unanswered: { type: Number },
    totalMarks: { type: Number },
    maxMarks: { type: Number },
    percentage: { type: Number },
    accuracy: { type: Number },
    timeTakenSeconds: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<ITestResult>('TestResult', TestResultSchema);
