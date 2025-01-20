import { IMailer } from 'src/core/ports/mailer.interface';
import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';
import { WebinarNotFound } from '../exceptions/webinar-not-found';
import { WebinarNotEnoughSeatsException } from '../exceptions/webinar-not-enough-seats';
import { WebinarAlreadyParticipatingException } from '../exceptions/webinar-already-participating';
import { Participation } from '../entities/participation.entity';

type Request = {
  webinarId: string;
  user: User;
};
type Response = void;

export class BookSeat implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly webinarRepository: IWebinarRepository,
    private readonly mailer: IMailer,
  ) {}

  async execute({ webinarId, user }: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(webinarId);
    if (!webinar) {
      throw new WebinarNotFound();
    }
    const participation = await this.participationRepository.findByWebinarId(webinarId);
    const notEnoughSeats = webinar.props.seats - participation.length <= 0;
    if (notEnoughSeats) {
      throw new WebinarNotEnoughSeatsException();
    }
    const userAlreadyParticipating = await this.participationRepository.findByWebinarAndUser(webinarId, user.id);
    if (userAlreadyParticipating) {
      throw new WebinarAlreadyParticipatingException();
    }
    const newParticipation = new Participation({ userId: user.id, webinarId });
    await this.participationRepository.save(newParticipation).then(() => {
      this.mailer.send({
        to: webinar.props.organizerId,
        subject: 'New participant registered',
        body: `A new participant (${user.id}) has booked a seat for your webinar (${webinarId})`,
      });
    });
  }
}
