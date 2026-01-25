import initSqlJs, { Database } from 'sql.js';
import { IDatabaseService } from './interfaces';
import { SCHEMA_SQL, DEFAULT_DOCTOR } from './schema';

const DB_STORAGE_KEY = 'brightsight_sqlite_db';

export class SqlJsService implements IDatabaseService {
  private db: Database | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load sql.js WASM from CDN
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });

    // Try to load existing database from localStorage
    const savedData = localStorage.getItem(DB_STORAGE_KEY);
    if (savedData) {
      try {
        const uint8Array = new Uint8Array(JSON.parse(savedData));
        this.db = new SQL.Database(uint8Array);
        console.log('SQLite database loaded from storage');
      } catch (error) {
        console.error('Failed to load database from storage, creating new:', error);
        this.db = new SQL.Database();
        await this.runMigrations();
      }
    } else {
      this.db = new SQL.Database();
      await this.runMigrations();
      console.log('New SQLite database created');
    }

    this.initialized = true;
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) return;

    // Execute schema creation
    this.db.run(SCHEMA_SQL);

    // Seed default doctor user
    await this.seedDefaultData();
    await this.save();
  }

  private async seedDefaultData(): Promise<void> {
    // Check if default doctor exists
    const existing = this.get<{ id: string }>(
      'SELECT id FROM users WHERE email = ?',
      [DEFAULT_DOCTOR.email]
    );

    if (!existing) {
      this.run(
        `INSERT INTO users (id, email, name, password_hash, role, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          DEFAULT_DOCTOR.id,
          DEFAULT_DOCTOR.email,
          DEFAULT_DOCTOR.name,
          DEFAULT_DOCTOR.password,
          DEFAULT_DOCTOR.role,
          new Date().toISOString(),
        ]
      );
      console.log('Default doctor user seeded');
    }
  }

  run(sql: string, params?: any[]): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.run(sql, params);
  }

  get<T>(sql: string, params?: any[]): T | undefined {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(sql);
    if (params) stmt.bind(params);
    
    if (stmt.step()) {
      const result = stmt.getAsObject() as T;
      stmt.free();
      return result;
    }
    
    stmt.free();
    return undefined;
  }

  all<T>(sql: string, params?: any[]): T[] {
    if (!this.db) throw new Error('Database not initialized');
    
    const results: T[] = [];
    const stmt = this.db.prepare(sql);
    if (params) stmt.bind(params);
    
    while (stmt.step()) {
      results.push(stmt.getAsObject() as T);
    }
    
    stmt.free();
    return results;
  }

  async save(): Promise<void> {
    if (!this.db) return;
    
    const data = this.db.export();
    const jsonArray = JSON.stringify(Array.from(data));
    
    try {
      localStorage.setItem(DB_STORAGE_KEY, jsonArray);
    } catch (error) {
      // If localStorage is full, log error
      console.error('Failed to save database to localStorage:', error);
      throw error;
    }
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}
