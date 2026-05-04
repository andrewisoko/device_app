import { Module } from '@nestjs/common';
import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inbox } from './entity/inbox.entity';
import { User } from 'src/user/entity/user.entity';
import { Contract } from 'src/contract/entity/contract.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSchema } from 'src/account/document/account.doc';
import { VirtualCard } from 'src/virtual_card/entity/virtual.card.entity';
import { VirtualCardService } from 'src/virtual_card/virtual.card.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
    TypeOrmModule.forFeature([
      Inbox,
      User,
      Contract,
      VirtualCard
    ]),
  ],
  controllers: [InboxController],
  providers: [InboxService, VirtualCardService],
  exports: [InboxService],
})
export class InboxModule {}
