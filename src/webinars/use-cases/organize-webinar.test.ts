import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';
import { FixedIdGenerator } from '../../core/adapters/fixed-id-generator';
import { FixedDateGenerator } from '../../core/adapters/fixed-date-generator';
import { OrganizeWebinars } from './organize-webinar';
import { Webinar } from '../entities/webinar.entity';
import { IIdGenerator } from '../../core/ports/id-generator.interface';
import { IDateGenerator } from '../../core/ports/date-generator.interface';

describe('Feature: Organize webinars', () => {
  let repository: InMemoryWebinarRepository;
  let idGenerator: IIdGenerator;
  let useCase: OrganizeWebinars;
  let dateGenerator: IDateGenerator;

  const payload = {
    userId: 'user-alice-id',
    title: 'Webinar title',
    seats: 100,
    startDate: new Date('2024-01-10T10:00:00.000Z'),
    endDate: new Date('2024-01-10T11:00:00.000Z'),
  };

  function expectWebinarToEqual(webinar: Webinar) {
    expect(webinar).toEqual({
      props: {
        id: 'id-1',
        organizerId: 'user-alice-id',
        title: 'Webinar title',
        startDate: new Date('2024-01-10T10:00:00.000Z'),
        endDate: new Date('2024-01-10T11:00:00.000Z'),
        seats: 100,
      },
      initialState: {
        id: 'id-1',
        organizerId: 'user-alice-id',
        title: 'Webinar title',
        startDate: new Date('2024-01-10T10:00:00.000Z'),
        endDate: new Date('2024-01-10T11:00:00.000Z'),
        seats: 100,
      },
    });
  }

  beforeEach(() => {
    repository = new InMemoryWebinarRepository();
    idGenerator = new FixedIdGenerator();
    dateGenerator = new FixedDateGenerator();
    useCase = new OrganizeWebinars(repository, idGenerator, dateGenerator);
  });

  describe('Scenario: happy path', () => {
    it('should create a webinar', async () => {
      const result = await useCase.execute(payload);

      expect(result).toEqual({ id: 'id-1' });
    });

    it('should insert a new webinar in the repository', async () => {
      await useCase.execute(payload);

      const createdWebinar = repository.database[0];
      expectWebinarToEqual(createdWebinar);
    });
  });

  describe('Scenario: webinar happens too soon', () => {
    const payload = {
      userId: 'user-alice-id',
      title: 'Webinar title',
      seats: 100,
      startDate: new Date('2024-01-03T23:59:59.000Z'),
      endDate: new Date('2024-01-03T23:59:59.000Z'),
    };

    it('should throw an error', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow('Webinar must be scheduled at least 3 days in advance');
    });

    it('should not insert the webinar in the repository', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow('Webinar must be scheduled at least 3 days in advance');

      expect(repository.database).toEqual([]);
    });
  });

  describe('Scenario: webinar has too many seats', () => {
    const payload = {
      userId: 'user-alice-id',
      title: 'Webinar title',
      seats: 1001,
      startDate: new Date('2024-01-10T10:00:00.000Z'),
      endDate: new Date('2024-01-10T11:00:00.000Z'),
    };

    it('should throw an error', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow('Webinar must have at most 1000 seats'
      );
    });

    it('should not insert the webinar in the repository', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow('Webinar must have at most 1000 seats'
      );

      expect(repository.database).toEqual([]);
    });
  });

  describe('Scenario: webinar does not have enough seats', () => {
    const payload = {
      userId: 'user-alice-id',
      title: 'Webinar title',
      seats: 0,
      startDate: new Date('2024-01-10T10:00:00.000Z'),
      endDate: new Date('2024-01-10T11:00:00.000Z'),
    };

    it('should throw an error', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow('Webinar must have at least 1 seat');
    });

    it('should not insert the webinar in the repository', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow('Webinar must have at least 1 seat');

      expect(repository.database).toEqual([]);
    });
  });
});