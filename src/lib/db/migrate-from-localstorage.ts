import { UserRepository } from './repositories/user-repository';
import { DetectionRepository } from './repositories/detection-repository';
import { User, Detection } from '@/types';

const MIGRATION_COMPLETE_KEY = 'eyecare_sqlite_migrated';

// Old localStorage keys
const OLD_USERS_KEY = 'eyecare_users';
const OLD_DETECTIONS_KEY = 'eyecare_detections';

export async function migrateFromLocalStorage(
  userRepo: UserRepository,
  detectionRepo: DetectionRepository
): Promise<{ usersMigrated: number; detectionsMigrated: number }> {
  // Check if migration already completed
  if (localStorage.getItem(MIGRATION_COMPLETE_KEY)) {
    console.log('Migration already completed, skipping...');
    return { usersMigrated: 0, detectionsMigrated: 0 };
  }

  let usersMigrated = 0;
  let detectionsMigrated = 0;

  try {
    // Migrate users
    const usersJson = localStorage.getItem(OLD_USERS_KEY);
    if (usersJson) {
      const users: User[] = JSON.parse(usersJson);
      for (const user of users) {
        // Skip if user already exists (e.g., default doctor)
        const existing = userRepo.findByEmail(user.email);
        if (existing) {
          console.log(`User ${user.email} already exists, skipping...`);
          continue;
        }

        // Get password from old storage
        const password = localStorage.getItem(`eyecare_pwd_${user.email}`) || 'migrated';
        
        try {
          userRepo.create(
            {
              email: user.email,
              name: user.name,
              role: user.role,
            },
            password
          );
          usersMigrated++;
          console.log(`Migrated user: ${user.email}`);
        } catch (error) {
          console.error(`Failed to migrate user ${user.email}:`, error);
        }
      }
    }

    // Migrate detections
    const detectionsJson = localStorage.getItem(OLD_DETECTIONS_KEY);
    if (detectionsJson) {
      const detections: Detection[] = JSON.parse(detectionsJson);
      for (const detection of detections) {
        try {
          const created = detectionRepo.create({
            userId: detection.userId,
            patientName: detection.patientName,
            patientAge: detection.patientAge,
            imagePath: detection.imagePath,
            imageBase64: detection.imageBase64,
            classification: detection.classification,
            confidence: detection.confidence,
            description: detection.description,
            remarks: detection.remarks,
            status: detection.doctorReview ? 'reviewed' : detection.status,
            preliminaryFindings: detection.preliminaryFindings,
            allProbabilities: detection.allProbabilities,
            reviewUrgency: detection.reviewUrgency,
            doctorReview: null,
          });

          // Migrate doctor review if exists
          if (detection.doctorReview) {
            detectionRepo.addDoctorReview(created.id, {
              doctorId: detection.doctorReview.doctorId,
              doctorName: detection.doctorReview.doctorName,
              diagnosis: detection.doctorReview.diagnosis,
              recommendations: detection.doctorReview.recommendations,
              severity: detection.doctorReview.severity,
              followUpDate: detection.doctorReview.followUpDate,
            });
          }

          detectionsMigrated++;
          console.log(`Migrated detection: ${detection.id}`);
        } catch (error) {
          console.error(`Failed to migrate detection ${detection.id}:`, error);
        }
      }
    }

    // Mark migration as complete
    localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
    
    // Optionally clean up old localStorage keys
    // Uncomment these lines after confirming migration works:
    // localStorage.removeItem(OLD_USERS_KEY);
    // localStorage.removeItem(OLD_DETECTIONS_KEY);

    console.log(`Migration complete: ${usersMigrated} users, ${detectionsMigrated} detections`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }

  return { usersMigrated, detectionsMigrated };
}
