import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  id: string;
  subject: string;
  originalQuestionNumber: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  hasDiagram?: boolean;
  needsReview?: boolean;
  rawText?: string;
  sourcePdf?: string;
  sourcePage?: number;
  sourcePagePath?: string;
  diagramPath?: string;
  validationStatus?: 'verified' | 'needs_review';
}

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  subject: { type: String, required: true, index: true },
  originalQuestionNumber: { type: Number },
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctAnswerIndex: { type: Number, required: true },
  explanation: { type: String },
  hasDiagram: { type: Boolean, default: false },
  needsReview: { type: Boolean, default: false },
  rawText: { type: String },
  sourcePdf: { type: String },
  sourcePage: { type: Number },
  sourcePagePath: { type: String },
  diagramPath: { type: String },
  validationStatus: { type: String, enum: ['verified', 'needs_review'], default: 'needs_review' },
});

export default mongoose.model<IQuestion>('Question', QuestionSchema);
