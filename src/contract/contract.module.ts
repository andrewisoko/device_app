import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/transaction/entity/transaction.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Transaction
    ])
  ],
  controllers: [ContractController],
  providers: [ContractService]
})
export class ContractModule {}
