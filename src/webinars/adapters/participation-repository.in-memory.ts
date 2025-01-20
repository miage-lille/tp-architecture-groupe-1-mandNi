import { IParticipationRepository } from '../ports/participation-repository.interface';
import { Participation } from '../entities/participation.entity';

export class InMemoryParticipationRepository implements IParticipationRepository {
  constructor(public database: Participation[] = []) {}

  findByWebinarAndUser(webinarId: string, userId: string): Promise<Participation | null> {
    return Promise.resolve(
      this.database.find(
        (participation) => participation.props.webinarId === webinarId && participation.props.userId === userId,
      ) || null,
    );
  }

  findByWebinarId(webinarId: string): Promise<Participation[]> {
    return Promise.resolve(this.database.filter((participation) => participation.props.webinarId === webinarId));
  }

  save(participation: Participation): Promise<void> {
    this.database.push(participation);
    return Promise.resolve();
  }
}
