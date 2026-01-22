import { Detection, DoctorReview, PreliminaryFinding, DiseaseType } from '@/types';
import { IDatabaseService, DetectionRow, DoctorReviewRow } from '../interfaces';

export class DetectionRepository {
  constructor(private db: IDatabaseService) {}

  findById(id: string): Detection | undefined {
    const row = this.db.get<DetectionRow>(
      'SELECT * FROM detections WHERE id = ?',
      [id]
    );
    if (!row) return undefined;

    const detection = this.mapRowToDetection(row);
    
    // Load doctor review if exists
    const reviewRow = this.db.get<DoctorReviewRow>(
      'SELECT * FROM doctor_reviews WHERE detection_id = ?',
      [id]
    );
    if (reviewRow) {
      detection.doctorReview = this.mapRowToReview(reviewRow);
    }

    return detection;
  }

  findByUserId(userId: string): Detection[] {
    const rows = this.db.all<DetectionRow>(
      'SELECT * FROM detections WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows.map((row) => {
      const detection = this.mapRowToDetection(row);
      const reviewRow = this.db.get<DoctorReviewRow>(
        'SELECT * FROM doctor_reviews WHERE detection_id = ?',
        [row.id]
      );
      if (reviewRow) {
        detection.doctorReview = this.mapRowToReview(reviewRow);
      }
      return detection;
    });
  }

  findAll(): Detection[] {
    const rows = this.db.all<DetectionRow>(
      'SELECT * FROM detections ORDER BY created_at DESC'
    );
    return rows.map((row) => {
      const detection = this.mapRowToDetection(row);
      const reviewRow = this.db.get<DoctorReviewRow>(
        'SELECT * FROM doctor_reviews WHERE detection_id = ?',
        [row.id]
      );
      if (reviewRow) {
        detection.doctorReview = this.mapRowToReview(reviewRow);
      }
      return detection;
    });
  }

  create(detection: Omit<Detection, 'id' | 'createdAt' | 'updatedAt'>): Detection {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO detections (
        id, user_id, patient_name, patient_age, image_path, image_base64,
        classification, confidence, description, remarks, status,
        preliminary_findings, all_probabilities, review_urgency,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        detection.userId,
        detection.patientName,
        detection.patientAge,
        detection.imagePath,
        detection.imageBase64 || null,
        detection.classification,
        detection.confidence,
        detection.description,
        detection.remarks,
        detection.status,
        detection.preliminaryFindings ? JSON.stringify(detection.preliminaryFindings) : null,
        detection.allProbabilities ? JSON.stringify(detection.allProbabilities) : null,
        detection.reviewUrgency || null,
        now,
        now,
      ]
    );

    this.db.save();

    return {
      ...detection,
      id,
      createdAt: now,
      updatedAt: now,
    };
  }

  update(id: string, updates: Partial<Detection>): Detection | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    
    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.patientName !== undefined) {
      fields.push('patient_name = ?');
      values.push(updates.patientName);
    }
    if (updates.patientAge !== undefined) {
      fields.push('patient_age = ?');
      values.push(updates.patientAge);
    }
    if (updates.classification !== undefined) {
      fields.push('classification = ?');
      values.push(updates.classification);
    }
    if (updates.confidence !== undefined) {
      fields.push('confidence = ?');
      values.push(updates.confidence);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.remarks !== undefined) {
      fields.push('remarks = ?');
      values.push(updates.remarks);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.preliminaryFindings !== undefined) {
      fields.push('preliminary_findings = ?');
      values.push(JSON.stringify(updates.preliminaryFindings));
    }
    if (updates.allProbabilities !== undefined) {
      fields.push('all_probabilities = ?');
      values.push(JSON.stringify(updates.allProbabilities));
    }
    if (updates.reviewUrgency !== undefined) {
      fields.push('review_urgency = ?');
      values.push(updates.reviewUrgency);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    this.db.run(
      `UPDATE detections SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    this.db.save();

    return this.findById(id) || null;
  }

  delete(id: string): void {
    // Doctor reviews are deleted via CASCADE
    this.db.run('DELETE FROM detections WHERE id = ?', [id]);
    this.db.save();
  }

  addDoctorReview(detectionId: string, review: Omit<DoctorReview, 'reviewedAt'>): Detection | null {
    const reviewId = crypto.randomUUID();
    const reviewedAt = new Date().toISOString();

    // Delete existing review if any
    this.db.run('DELETE FROM doctor_reviews WHERE detection_id = ?', [detectionId]);

    // Insert new review
    this.db.run(
      `INSERT INTO doctor_reviews (
        id, detection_id, doctor_id, doctor_name, diagnosis,
        recommendations, severity, follow_up_date, reviewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reviewId,
        detectionId,
        review.doctorId,
        review.doctorName,
        review.diagnosis,
        review.recommendations,
        review.severity,
        review.followUpDate || null,
        reviewedAt,
      ]
    );

    // Update detection status
    this.db.run(
      'UPDATE detections SET status = ?, updated_at = ? WHERE id = ?',
      ['reviewed', reviewedAt, detectionId]
    );

    this.db.save();

    return this.findById(detectionId);
  }

  private mapRowToDetection(row: DetectionRow): Detection {
    return {
      id: row.id,
      userId: row.user_id,
      patientName: row.patient_name,
      patientAge: row.patient_age,
      imagePath: row.image_path || '',
      imageBase64: row.image_base64 || undefined,
      classification: row.classification as DiseaseType | null,
      confidence: row.confidence,
      description: row.description || '',
      remarks: row.remarks || '',
      status: row.status,
      preliminaryFindings: row.preliminary_findings 
        ? JSON.parse(row.preliminary_findings) as PreliminaryFinding[]
        : undefined,
      allProbabilities: row.all_probabilities
        ? JSON.parse(row.all_probabilities) as Record<DiseaseType, number>
        : undefined,
      reviewUrgency: row.review_urgency as 'routine' | 'priority' | 'urgent' | undefined,
      doctorReview: null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapRowToReview(row: DoctorReviewRow): DoctorReview {
    return {
      doctorId: row.doctor_id,
      doctorName: row.doctor_name,
      diagnosis: row.diagnosis,
      recommendations: row.recommendations,
      severity: row.severity,
      followUpDate: row.follow_up_date || undefined,
      reviewedAt: row.reviewed_at,
    };
  }
}
