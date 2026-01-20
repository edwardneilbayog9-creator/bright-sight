import { useState, useEffect } from 'react';
import { Detection, DoctorReview } from '@/types';
import { useAuth } from './useAuth';

const DETECTIONS_KEY = 'eyecare_detections';

export function useDetections() {
  const { user } = useAuth();
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDetections();
  }, [user]);

  const loadDetections = () => {
    const stored = localStorage.getItem(DETECTIONS_KEY);
    const allDetections: Detection[] = stored ? JSON.parse(stored) : [];
    
    // Filter by user if not admin/doctor
    if (user?.role === 'technician') {
      setDetections(allDetections.filter(d => d.userId === user.id));
    } else {
      setDetections(allDetections);
    }
    setIsLoading(false);
  };

  const saveDetections = (newDetections: Detection[]) => {
    localStorage.setItem(DETECTIONS_KEY, JSON.stringify(newDetections));
    loadDetections();
  };

  const addDetection = (detection: Omit<Detection, 'id' | 'createdAt' | 'updatedAt'>) => {
    const stored = localStorage.getItem(DETECTIONS_KEY);
    const allDetections: Detection[] = stored ? JSON.parse(stored) : [];
    
    const newDetection: Detection = {
      ...detection,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allDetections.push(newDetection);
    saveDetections(allDetections);
    return newDetection;
  };

  const updateDetection = (id: string, updates: Partial<Detection>) => {
    const stored = localStorage.getItem(DETECTIONS_KEY);
    const allDetections: Detection[] = stored ? JSON.parse(stored) : [];
    
    const index = allDetections.findIndex(d => d.id === id);
    if (index !== -1) {
      allDetections[index] = {
        ...allDetections[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveDetections(allDetections);
      return allDetections[index];
    }
    return null;
  };

  const addDoctorReview = (detectionId: string, review: Omit<DoctorReview, 'reviewedAt'>) => {
    const fullReview: DoctorReview = {
      ...review,
      reviewedAt: new Date().toISOString(),
    };

    return updateDetection(detectionId, {
      doctorReview: fullReview,
      status: 'reviewed',
    });
  };

  const deleteDetection = (id: string) => {
    const stored = localStorage.getItem(DETECTIONS_KEY);
    const allDetections: Detection[] = stored ? JSON.parse(stored) : [];
    
    const filtered = allDetections.filter(d => d.id !== id);
    saveDetections(filtered);
  };

  const getDetectionById = (id: string) => {
    return detections.find(d => d.id === id);
  };

  return {
    detections,
    isLoading,
    addDetection,
    updateDetection,
    addDoctorReview,
    deleteDetection,
    getDetectionById,
    refresh: loadDetections,
  };
}
