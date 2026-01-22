import { useState, useEffect, useCallback } from 'react';
import { Detection, DoctorReview } from '@/types';
import { useAuth } from './useAuth';
import { useDatabase } from '@/lib/db';

export function useDetections() {
  const { user } = useAuth();
  const { isReady, detectionRepository } = useDatabase();
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDetections = useCallback(() => {
    if (!isReady || !detectionRepository || !user) {
      setDetections([]);
      return;
    }

    try {
      // Filter by user if technician
      if (user.role === 'technician') {
        setDetections(detectionRepository.findByUserId(user.id));
      } else {
        setDetections(detectionRepository.findAll());
      }
    } catch (error) {
      console.error('Failed to load detections:', error);
      setDetections([]);
    }
    setIsLoading(false);
  }, [isReady, detectionRepository, user]);

  useEffect(() => {
    if (isReady && user) {
      loadDetections();
    } else if (isReady && !user) {
      setIsLoading(false);
    }
  }, [isReady, user, loadDetections]);

  const addDetection = (detection: Omit<Detection, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!detectionRepository) return null;

    try {
      const newDetection = detectionRepository.create(detection);
      loadDetections();
      return newDetection;
    } catch (error) {
      console.error('Failed to add detection:', error);
      return null;
    }
  };

  const updateDetection = (id: string, updates: Partial<Detection>) => {
    if (!detectionRepository) return null;

    try {
      const updated = detectionRepository.update(id, updates);
      loadDetections();
      return updated;
    } catch (error) {
      console.error('Failed to update detection:', error);
      return null;
    }
  };

  const addDoctorReview = (detectionId: string, review: Omit<DoctorReview, 'reviewedAt'>) => {
    if (!detectionRepository) return null;

    try {
      const updated = detectionRepository.addDoctorReview(detectionId, review);
      loadDetections();
      return updated;
    } catch (error) {
      console.error('Failed to add doctor review:', error);
      return null;
    }
  };

  const deleteDetection = (id: string) => {
    if (!detectionRepository) return;

    try {
      detectionRepository.delete(id);
      loadDetections();
    } catch (error) {
      console.error('Failed to delete detection:', error);
    }
  };

  const getDetectionById = (id: string) => {
    if (!detectionRepository) return undefined;

    try {
      return detectionRepository.findById(id);
    } catch (error) {
      console.error('Failed to get detection:', error);
      return undefined;
    }
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
