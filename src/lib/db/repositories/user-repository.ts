import { User } from '@/types';
import { IDatabaseService, UserRow } from '../interfaces';

export class UserRepository {
  constructor(private db: IDatabaseService) {}

  findByEmail(email: string): User | undefined {
    const row = this.db.get<UserRow>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return row ? this.mapRowToUser(row) : undefined;
  }

  findById(id: string): User | undefined {
    const row = this.db.get<UserRow>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return row ? this.mapRowToUser(row) : undefined;
  }

  create(user: Omit<User, 'id' | 'createdAt'>, password: string): User {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    this.db.run(
      `INSERT INTO users (id, email, name, password_hash, role, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user.email, user.name, password, user.role, createdAt]
    );

    this.db.save();

    return {
      id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt,
    };
  }

  validatePassword(email: string, password: string): boolean {
    const row = this.db.get<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE email = ?',
      [email]
    );
    return row?.password_hash === password;
  }

  getAll(): User[] {
    const rows = this.db.all<UserRow>('SELECT * FROM users');
    return rows.map(this.mapRowToUser);
  }

  private mapRowToUser(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      createdAt: row.created_at,
    };
  }
}
