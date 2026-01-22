// Database service interface - implementations can be sql.js (web) or better-sqlite3 (Electron)
export interface IDatabaseService {
  // Lifecycle
  initialize(): Promise<void>;
  close(): void;
  
  // Generic operations
  run(sql: string, params?: any[]): void;
  get<T>(sql: string, params?: any[]): T | undefined;
  all<T>(sql: string, params?: any[]): T[];
  
  // Persistence (for sql.js - saves to localStorage/IndexedDB)
  save(): Promise<void>;
}

// Database row types (snake_case from SQL)
export interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: 'admin' | 'doctor' | 'technician';
  created_at: string;
}

export interface DetectionRow {
  id: string;
  user_id: string;
  patient_name: string;
  patient_age: number;
  image_path: string | null;
  image_base64: string | null;
  classification: string | null;
  confidence: number;
  description: string | null;
  remarks: string | null;
  status: 'pending' | 'analyzed' | 'reviewed';
  preliminary_findings: string | null;
  all_probabilities: string | null;
  review_urgency: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorReviewRow {
  id: string;
  detection_id: string;
  doctor_id: string;
  doctor_name: string;
  diagnosis: string;
  recommendations: string;
  severity: 'mild' | 'moderate' | 'severe';
  follow_up_date: string | null;
  reviewed_at: string;
}
