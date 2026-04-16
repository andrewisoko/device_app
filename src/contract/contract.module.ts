import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { ContractSchema } from './document/contract.doc';
import { User } from 'src/user/entity/user.entity';
import { Account } from 'src/account/document/account.doc';
import { UserService } from 'src/user/user.service';
import { InboxService } from 'src/inbox/inbox.service';
import { Inbox } from 'src/inbox/entity/inbox.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: 'Contract', schema: ContractSchema }]),
    TypeOrmModule.forFeature([
      Transaction,
      User,
      Account,
      Inbox
    ])
  ],
  controllers: [ContractController],
  providers: [
    ContractService,
    UserService,
    InboxService
  ]
})
export class ContractModule {}
