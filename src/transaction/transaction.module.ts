import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Contract } from 'src/contract/entity/contract.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
      TypeOrmModule.forFeature([
        Contract
      ])
    ],
  providers: [TransactionService],
  controllers: [TransactionController]
})
export class TransactionModule {}
