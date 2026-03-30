import { Module } from '@nestjs/common';
import { VirtualCardController } from './virtual.card.controller';
import { VirtualCardService } from './virtual.card.service';

@Module({
  controllers: [VirtualCardController],
  providers: [VirtualCardService]
})
export class VirtualCardModule {}
