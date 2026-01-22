// Database module exports
export { DatabaseProvider, useDatabase } from './DatabaseContext';
export { SqlJsService } from './sqljs-service';
export { UserRepository } from './repositories/user-repository';
export { DetectionRepository } from './repositories/detection-repository';
export { migrateFromLocalStorage } from './migrate-from-localstorage';
export type { IDatabaseService, UserRow, DetectionRow, DoctorReviewRow } from './interfaces';
