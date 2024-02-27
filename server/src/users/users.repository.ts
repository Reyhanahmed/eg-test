import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { excludePrismaFields } from 'src/utils/excludePrismaFields';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UNIQUE_CONSTRAINT_VIOLATION } from 'src/utils/constants/errorCodes.constant';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  getSanitizedUser(user: User) {
    return excludePrismaFields(user, ['password', 'refreshToken']);
  }

  async create(userData: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          ...userData,
        },
      });
      console.log('USER ', user);
      return this.getSanitizedUser(user);
    } catch (error) {
      const err = error as PrismaClientKnownRequestError;
      if (err.code === UNIQUE_CONSTRAINT_VIOLATION) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
    }
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (user) return user;

    throw new NotFoundException(`User with this id ${id} does not exist`);
  }

  async getByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) return user;

    throw new NotFoundException(`User with this email ${email} does not exist`);
  }

  async update(id: string, user: Partial<User>) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...user,
      },
    });
  }
}
