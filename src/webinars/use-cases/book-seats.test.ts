import { BookSeat } from 'src/webinars/use-cases/book-seat';
import { InMemoryParticipationRepository } from 'src/webinars/adapters/participation-repository.in-memory';
import { InMemoryWebinarRepository } from 'src/webinars/adapters/webinar-repository.in-memory';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { User } from 'src/users/entities/user.entity';
import { WebinarNotFound } from 'src/webinars/exceptions/webinar-not-found';
import { WebinarNotEnoughSeatsException } from 'src/webinars/exceptions/webinar-not-enough-seats';
import { WebinarAlreadyParticipatingException } from 'src/webinars/exceptions/webinar-already-participating';
import { Participation } from '../entities/participation.entity';

describe('Feature: Book a seat', () => {
  let participationRepository: InMemoryParticipationRepository;
  let webinarRepository: InMemoryWebinarRepository;
  let mailer: { send: jest.Mock };
  let useCase: BookSeat;

  const webinar = new Webinar({
    id: 'webinar-1',
    organizerId: 'user-organizer-id',
    title: 'Webinar Title',
    startDate: new Date('2024-01-10T10:00:00.000Z'),
    endDate: new Date('2024-01-10T11:00:00.000Z'),
    seats: 2,
  });

  const user = new User({
    id: 'user-alice-id',
    email: 'alice@example.com',
    password: 'password',
  });

  beforeEach(() => {
    participationRepository = new InMemoryParticipationRepository();
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    mailer = { send: jest.fn() };
    useCase = new BookSeat(participationRepository, webinarRepository, mailer);
  });

  describe('Scenario: Successful booking', () => {
    it('should book a seat and send an email', async () => {
      await useCase.execute({ webinarId: 'webinar-1', user });

      expect(participationRepository.database.length).toBe(1);
      expect(participationRepository.database[0].props).toEqual({
        userId: 'user-alice-id',
        webinarId: 'webinar-1',
      });

      expect(mailer.send).toHaveBeenCalledWith({
        to: 'alice@example.com',
        subject: 'You have successfully booked a seat!',
        body: 'You have successfully booked a seat for the webinar Webinar Title',
      });
    });
  });

  describe('Scenario: Webinar not found', () => {
    it('should throw a WebinarNotFound error', async () => {
      await expect(
        useCase.execute({ webinarId: 'non-existent-webinar', user }),
      ).rejects.toThrow(WebinarNotFound);

      expect(participationRepository.database.length).toBe(0);
      expect(mailer.send).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Not enough seats', () => {
    it('should throw a WebinarNotEnoughSeatsException', async () => {
      participationRepository.database.push(
        new Participation({ userId: 'user-bob-id', webinarId: 'webinar-1' }),
        new Participation({
          userId: 'user-charlie-id',
          webinarId: 'webinar-1',
        }),
      );

      await expect(
        useCase.execute({ webinarId: 'webinar-1', user }),
      ).rejects.toThrow(WebinarNotEnoughSeatsException);

      expect(participationRepository.database.length).toBe(2);
      expect(mailer.send).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Already participating', () => {
    it('should throw a WebinarAlreadyParticipatingException', async () => {
      participationRepository.database.push(
        new Participation({ userId: 'user-alice-id', webinarId: 'webinar-1' }),
      );

      await expect(
        useCase.execute({ webinarId: 'webinar-1', user }),
      ).rejects.toThrow(WebinarAlreadyParticipatingException);

      expect(participationRepository.database.length).toBe(1);
      expect(mailer.send).not.toHaveBeenCalled();
    });
  });
});
