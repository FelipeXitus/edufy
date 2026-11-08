import z from 'zod/v4';

export class EmailAddress {
  public readonly email: string;

  constructor(address: string) {
    this.email = z.email().parse(address);
  }

  toString(): string {
    return this.email;
  }
}
