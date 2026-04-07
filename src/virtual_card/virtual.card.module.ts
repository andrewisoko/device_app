import { Module } from '@nestjs/common';
import { VirtualCardController } from './virtual.card.controller';
import { VirtualCardService } from './virtual.card.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualCard } from './entity/virtual.card.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      VirtualCard
    ])
  ],
  controllers: [VirtualCardController],
  providers: [VirtualCardService]
})
export class VirtualCardModule {}
