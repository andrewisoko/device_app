import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VirtualCardModule } from '../src/virtual_card/virtual.card.module';
import { ContractModule } from '../src/contract/contract.module';
import { UserModule } from '../src/user/user.module';
import { AccountModule } from '../src/account/account.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Account } from 'src/account/entity/account.entity';
import { VirtualCard } from 'src/virtual_card/entity/virtual.card.entity';
import { Contract } from 'src/contract/entity/contract.entity';
import { Transaction } from 'src/transaction/entity/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal:true,
      envFilePath:__dirname + '/../../.env'
     }),
    TypeOrmModule.forRootAsync({
      imports:[
        VirtualCardModule,
        UserModule,
        ContractModule,
        AccountModule,
      ],
      inject:[ConfigService],
      useFactory:(configService:ConfigService) => {

        return {
          type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 10),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        synchronize:true,
        entities:[
          User,
          Account,
          VirtualCard,
          Transaction,
          Contract
        ]
        }
      }
    })
    
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
