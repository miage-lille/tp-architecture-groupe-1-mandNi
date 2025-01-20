export class WebinarAlreadyParticipatingException extends Error {
  constructor() {
    super('User is already participating in this webinar');
    this.name = 'WebinarAlreadyParticipatingException';
  }
}
