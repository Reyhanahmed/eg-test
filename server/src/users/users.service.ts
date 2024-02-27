import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UsersRepository } from './users.repository';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  async create(userData: CreateUserDto) {
    return this.repository.create(userData);
  }

  async getById(id: string) {
    return this.repository.getById(id);
  }

  async getByEmail(email: string) {
    return this.repository.getByEmail(email);
  }

  async update(id: string, user: Partial<User>) {
    return this.repository.update(id, user);
  }
}
