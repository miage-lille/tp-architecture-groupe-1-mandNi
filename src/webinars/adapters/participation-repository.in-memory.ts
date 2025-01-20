import { IParticipationRepository } from '../ports/participation-repository.interface';
import { Participation } from '../entities/participation.entity';

export class InMemoryParticipationRepository implements IParticipationRepository {
  constructor(public database: Participation[] = []) {}

  async findByWebinarAndUser(webinarId: string, userId: string): Promise<Participation | null> {
    return this.database.find((participation) => participation.props.webinarId === webinarId
        && participation.props.userId === userId) || null;
  }

  async findByWebinarId(webinarId: string): Promise<Participation[]> {
    return this.database.filter((participation) => participation.props.webinarId === webinarId);
  }

  async save(participation: Participation): Promise<void> {
    this.database.push(participation);
  }
}
