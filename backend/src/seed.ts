import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Question from './models/Question';

dotenv.config();

const SUBJECTS = [
  { name: 'Mathematics & Applied Mechanics', file: 'Mathematics_and_Applied_Mechanics' },
  { name: 'Drawing', file: 'Drawing' },
  { name: 'Construction, Construction Materials, Stores Account', file: 'Construction_Construction_Materials_Stores_Account' },
  { name: 'Surveying', file: 'Surveying' },
  { name: 'General Civil Engineering', file: 'General_Civil_Engineering' },
];

// Keep a copy in backend/data so Render can seed without the legacy root app.
const DATA_DIR = path.resolve(__dirname, '../data');

const seed = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is not set');

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  for (const subject of SUBJECTS) {
    const filePath = path.join(DATA_DIR, `${subject.file}.json`);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}, skipping...`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const questions = data.map((q: any) => ({ ...q, subject: subject.name }));

    await Question.deleteMany({ subject: subject.name });
    await Question.insertMany(questions);
    console.log(`✅ Seeded ${questions.length} questions for: ${subject.name}`);
  }

  await mongoose.disconnect();
  console.log('🎉 Seeding complete!');
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
