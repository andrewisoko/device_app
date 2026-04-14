import { Controller,Post,Body } from '@nestjs/common';
import { VirtualCardService } from './virtual.card.service';

@Controller('virtual-card')
export class VirtualCardController {
    constructor( private readonly virtualCardService: VirtualCardService){}

    @Post('create-main')
        createMain(
            @Body() dataDto:{
                fullName:string,
                id:string,
            }
        ){
            return this.virtualCardService.createMainCard(dataDto.fullName,dataDto.id)
        }

    @Post('create-temp')
        createTemp(
            @Body() dataDto:{
                fullName:string,
                expiryTime:string,
                id:string
            }
        ){
            return this.virtualCardService.createTempCard(dataDto.fullName,dataDto.expiryTime,dataDto.id)
        }

    

    @Post('generate-qr-code')
        generateQRCode(
            @Body() dataDto:{
                pan:string,
                expiry:string
            }
        ){
            return this.virtualCardService.cardQRCode(dataDto.pan, dataDto.expiry)
        }
}
