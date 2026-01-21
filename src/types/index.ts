export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'technician';
  createdAt: string;
}

export interface PreliminaryFinding {
  id: string;
  finding: string;
  detected: boolean;
  confidence: 'high' | 'medium' | 'low';
}

export interface Detection {
  id: string;
  userId: string;
  patientName: string;
  patientAge: number;
  imagePath: string;
  imageBase64?: string;
  classification: DiseaseType | null;
  confidence: number;
  description: string;
  remarks: string;
  doctorReview: DoctorReview | null;
  status: 'pending' | 'analyzed' | 'reviewed';
  preliminaryFindings?: PreliminaryFinding[];
  allProbabilities?: Record<DiseaseType, number>;
  reviewUrgency?: 'routine' | 'priority' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export type DiseaseType = 'cataract' | 'diabetic_retinopathy' | 'glaucoma' | 'normal';

export interface DoctorReview {
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  recommendations: string;
  severity: 'mild' | 'moderate' | 'severe';
  followUpDate?: string;
  reviewedAt: string;
}

export interface DiseaseInfo {
  name: string;
  description: string;
  symptoms: string[];
  riskFactors: string[];
  treatment: string;
}

export interface ModelPerformance {
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}

export const MODEL_PERFORMANCE: Record<DiseaseType, ModelPerformance> = {
  cataract: { precision: 0.90, recall: 0.93, f1Score: 0.92, support: 233 },
  diabetic_retinopathy: { precision: 1.00, recall: 0.99, f1Score: 0.99, support: 224 },
  glaucoma: { precision: 0.82, recall: 0.82, f1Score: 0.82, support: 188 },
  normal: { precision: 0.84, recall: 0.81, f1Score: 0.83, support: 199 },
};

export const PRELIMINARY_FINDINGS_MAP: Record<DiseaseType, Array<{ finding: string; defaultDetected: boolean }>> = {
  diabetic_retinopathy: [
    { finding: 'Possible hemorrhages detected', defaultDetected: true },
    { finding: 'Microaneurysms may be present', defaultDetected: true },
    { finding: 'Vascular abnormalities noted', defaultDetected: true },
    { finding: 'Optic disk abnormality', defaultDetected: false },
    { finding: 'Hard exudates observed', defaultDetected: true },
  ],
  glaucoma: [
    { finding: 'Optic disk abnormality noted', defaultDetected: true },
    { finding: 'Cup-to-disk ratio may be elevated', defaultDetected: true },
    { finding: 'Nerve fiber layer changes suspected', defaultDetected: true },
    { finding: 'Possible hemorrhages detected', defaultDetected: false },
    { finding: 'Peripapillary atrophy observed', defaultDetected: true },
  ],
  cataract: [
    { finding: 'Lens opacity detected', defaultDetected: true },
    { finding: 'Crystalline lens changes observed', defaultDetected: true },
    { finding: 'Reduced image clarity due to media opacity', defaultDetected: true },
    { finding: 'Optic disk abnormality', defaultDetected: false },
  ],
  normal: [
    { finding: 'No significant abnormalities detected', defaultDetected: true },
    { finding: 'Retinal structures appear normal', defaultDetected: true },
    { finding: 'Optic disk appears healthy', defaultDetected: true },
    { finding: 'Vascular pattern within normal limits', defaultDetected: true },
  ],
};

export const DISEASE_INFO: Record<DiseaseType, DiseaseInfo> = {
  cataract: {
    name: 'Cataract',
    description: 'A cataract is a clouding of the normally clear lens of the eye. For people who have cataracts, seeing through cloudy lenses is a bit like looking through a frosty or fogged-up window.',
    symptoms: [
      'Clouded, blurred or dim vision',
      'Increasing difficulty with vision at night',
      'Sensitivity to light and glare',
      'Need for brighter light for reading',
      'Seeing halos around lights',
      'Frequent changes in eyeglass prescription',
      'Fading or yellowing of colors',
    ],
    riskFactors: [
      'Aging',
      'Diabetes',
      'Excessive exposure to sunlight',
      'Smoking',
      'Obesity',
      'High blood pressure',
      'Previous eye injury or inflammation',
    ],
    treatment: 'Surgery is the only effective treatment for cataracts. During cataract surgery, the cloudy natural lens is removed and replaced with a clear artificial lens.',
  },
  diabetic_retinopathy: {
    name: 'Diabetic Retinopathy',
    description: 'Diabetic retinopathy is a diabetes complication that affects eyes. It\'s caused by damage to the blood vessels of the light-sensitive tissue at the back of the eye (retina).',
    symptoms: [
      'Spots or dark strings floating in vision (floaters)',
      'Blurred vision',
      'Fluctuating vision',
      'Dark or empty areas in vision',
      'Vision loss',
      'Difficulty perceiving colors',
    ],
    riskFactors: [
      'Duration of diabetes',
      'Poor control of blood sugar level',
      'High blood pressure',
      'High cholesterol',
      'Pregnancy',
      'Tobacco use',
    ],
    treatment: 'Treatment depends on the stage of the disease. Options include laser treatment, injections of medications into the eye, and vitrectomy surgery.',
  },
  glaucoma: {
    name: 'Glaucoma',
    description: 'Glaucoma is a group of eye conditions that damage the optic nerve, the health of which is vital for good vision. This damage is often caused by abnormally high pressure in the eye.',
    symptoms: [
      'Patchy blind spots in peripheral or central vision',
      'Tunnel vision in advanced stages',
      'Severe headache',
      'Eye pain',
      'Nausea and vomiting',
      'Blurred vision',
      'Halos around lights',
      'Eye redness',
    ],
    riskFactors: [
      'High internal eye pressure',
      'Age over 60',
      'Family history of glaucoma',
      'Medical conditions like diabetes, heart disease',
      'Extreme nearsightedness or farsightedness',
      'Eye injury or certain types of eye surgery',
    ],
    treatment: 'Glaucoma damage can\'t be reversed, but treatment can slow or prevent vision loss. Treatment options include prescription eye drops, oral medications, laser treatment, and surgery.',
  },
  normal: {
    name: 'Normal/Healthy',
    description: 'The fundus image appears normal with no signs of the common eye diseases being screened (cataract, diabetic retinopathy, or glaucoma).',
    symptoms: [],
    riskFactors: [],
    treatment: 'No treatment required. Continue regular eye checkups as recommended by your ophthalmologist.',
  },
};
