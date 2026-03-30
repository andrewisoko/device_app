import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VirtualCardModule } from './virtual_card/virtual_card.module';
import { ContractModule } from './contract/contract.module';
import { UserModule } from './user/user.module';
import { AccountService } from './account/account.service';
import { AccountController } from './account/account.controller';
import { AccountModule } from './account/account.module';

@Module({
  imports: [VirtualCardModule, ContractModule, UserModule, AccountModule],
  controllers: [AppController, AccountController],
  providers: [AppService, AccountService],
})
export class AppModule {}
