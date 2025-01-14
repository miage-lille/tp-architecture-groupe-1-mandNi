export class WebinarNotFound extends Error {
  constructor() {
    super('No webinar found with the given ID');
    this.name = 'WebinarNotFound';
  }
}
