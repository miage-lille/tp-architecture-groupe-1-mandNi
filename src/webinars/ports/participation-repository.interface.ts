import { Participation } from 'src/webinars/entities/participation.entity';

export interface IParticipationRepository {
  findByWebinarId(webinarId: string): Promise<Participation[]>;
  findByWebinarAndUser(
    webinarId: string,
    userId: string,
  ): Promise<Participation | null>;
  save(participation: Participation): Promise<void>;
}
