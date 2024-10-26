import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class HashService {
  private readonly round = 10;

  async hash(payload: string): Promise<string> {
    return await hash(payload, this.round);
  }

  async verify(payload: string, hash: string): Promise<boolean> {
    return await compare(payload, hash);
  }
}
