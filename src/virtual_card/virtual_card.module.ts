import { Module } from '@nestjs/common';
import { VirtualCardController } from './virtual_card.controller';
import { VirtualCardService } from './virtual_card.service';

@Module({
  controllers: [VirtualCardController],
  providers: [VirtualCardService]
})
export class VirtualCardModule {}
