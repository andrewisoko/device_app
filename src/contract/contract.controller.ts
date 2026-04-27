import { Controller,Post,Body } from '@nestjs/common';
import { ContractService, contractProps } from './contract.service';
import { RegisterDto } from 'src/user/signUp.signIn/registerDto';


@Controller('contract')
    export class ContractController {

    constructor( private readonly contractService:ContractService){}

        
        @Post('send-contract')  
            sendContract(
                @Body() dataDto: contractProps & Partial<RegisterDto>
            ){
                return this.contractService.sendContract(dataDto,dataDto)
            }
}
