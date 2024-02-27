import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// making this module global since this is going to be used in every module
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
