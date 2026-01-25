// SQL Schema for the BrightSight application
export const SCHEMA_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'doctor', 'technician')) NOT NULL,
  created_at TEXT NOT NULL
);

-- Detections table
CREATE TABLE IF NOT EXISTS detections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  patient_age INTEGER NOT NULL,
  image_path TEXT,
  image_base64 TEXT,
  classification TEXT CHECK(classification IN ('cataract', 'diabetic_retinopathy', 'glaucoma', 'normal', NULL)),
  confidence REAL DEFAULT 0,
  description TEXT,
  remarks TEXT,
  status TEXT CHECK(status IN ('pending', 'analyzed', 'reviewed')) DEFAULT 'pending',
  preliminary_findings TEXT,
  all_probabilities TEXT,
  review_urgency TEXT CHECK(review_urgency IN ('routine', 'priority', 'urgent', NULL)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Doctor Reviews table
CREATE TABLE IF NOT EXISTS doctor_reviews (
  id TEXT PRIMARY KEY,
  detection_id TEXT UNIQUE NOT NULL,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  recommendations TEXT NOT NULL,
  severity TEXT CHECK(severity IN ('mild', 'moderate', 'severe')) NOT NULL,
  follow_up_date TEXT,
  reviewed_at TEXT NOT NULL,
  FOREIGN KEY (detection_id) REFERENCES detections(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_detections_user_id ON detections(user_id);
CREATE INDEX IF NOT EXISTS idx_detections_status ON detections(status);
CREATE INDEX IF NOT EXISTS idx_detections_created_at ON detections(created_at);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_detection_id ON doctor_reviews(detection_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

// Default doctor user for initial setup
export const DEFAULT_DOCTOR = {
  id: 'default-doctor-001',
  email: 'doctor@clinic.com',
  name: 'Dr. Ophthalmologist',
  password: 'password',
  role: 'doctor' as const,
};
