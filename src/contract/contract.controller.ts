import { Controller,Post,Body } from '@nestjs/common';
import { ContractService } from './contract.service';
import { SPLIT_AGREEMENT } from './document/contract.doc';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { CONTRACT_STATUS } from './document/contract.doc';


@Controller('contract')
    export class ContractController {

    constructor( private readonly contractService:ContractService){}

        /* name/ surname number and email data is provided by agreed consent of sharing sensitive data of user device  */
        // @Post('send-contract')  
        //     sendContract(
        //         @Body() contractDto: {  

        //             sender: string,
        //             receiver: string,
        //             split_agreement: SPLIT_AGREEMENT,
        //             transaction:Transaction, /* to change */
        //             contractStatus:CONTRACT_STATUS,
        //             repayment_agreement?:string,
        //             event_agreement?:string,
        //             location_agreement?:string,
        //             time_agreement?:string
        //     }
        //     ){
        //         return this.contractService.sendContract(contractDto,)
        //     }
}
