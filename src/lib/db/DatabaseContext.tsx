import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SqlJsService } from './sqljs-service';
import { UserRepository } from './repositories/user-repository';
import { DetectionRepository } from './repositories/detection-repository';
import { migrateFromLocalStorage } from './migrate-from-localstorage';
import { IDatabaseService } from './interfaces';

interface DatabaseContextType {
  isReady: boolean;
  isError: boolean;
  error: Error | null;
  dbService: IDatabaseService | null;
  userRepository: UserRepository | null;
  detectionRepository: DetectionRepository | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isReady: false,
  isError: false,
  error: null,
  dbService: null,
  userRepository: null,
  detectionRepository: null,
});

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [dbService, setDbService] = useState<IDatabaseService | null>(null);
  const [userRepository, setUserRepository] = useState<UserRepository | null>(null);
  const [detectionRepository, setDetectionRepository] = useState<DetectionRepository | null>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        console.log('Initializing SQLite database...');
        
        // Create and initialize the database service
        const service = new SqlJsService();
        await service.initialize();
        
        // Create repositories
        const userRepo = new UserRepository(service);
        const detectionRepo = new DetectionRepository(service);
        
        // Run migration from old localStorage data
        const migrationResult = await migrateFromLocalStorage(userRepo, detectionRepo);
        if (migrationResult.usersMigrated > 0 || migrationResult.detectionsMigrated > 0) {
          console.log('Migration completed:', migrationResult);
        }
        
        setDbService(service);
        setUserRepository(userRepo);
        setDetectionRepository(detectionRepo);
        setIsReady(true);
        
        console.log('SQLite database ready');
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err instanceof Error ? err : new Error('Database initialization failed'));
        setIsError(true);
      }
    };

    initDb();

    // Cleanup on unmount
    return () => {
      if (dbService) {
        dbService.close();
      }
    };
  }, []);

  return (
    <DatabaseContext.Provider
      value={{
        isReady,
        isError,
        error,
        dbService,
        userRepository,
        detectionRepository,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
