import { IUserRepository } from '../../users/ports/user-repository.interface';
import { User } from '../../users/entities/user.entity';

export class InMemoryUserRepository implements IUserRepository {

  constructor(public database: User[] = []) {}

  async findById(id: string): Promise<User | null> {
    return this.database.find((user) => user.props.id === id) || null;
  }
}
