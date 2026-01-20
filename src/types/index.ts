export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'technician';
  createdAt: string;
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
