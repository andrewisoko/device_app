import { Body, Controller, Post } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { Contract } from 'src/contract/entity/contract.entity';
import { User } from 'src/user/entity/user.entity';

@Controller('inbox')
export class InboxController {
    constructor(private readonly inboxService: InboxService) {}

    @Post('post-inbox')
    postInbox(
        @Body() dataDto:{ contract:Contract, user:User }
    ){
        this.inboxService.postInbox(
            dataDto.contract,
            dataDto.user
        )
    };

    @Post('receiver-inbox-contract')
        receivedContractOnInbox(
            @Body() dataDto:{ contractId: string, receiverUsername: string, accepted:boolean }
        ){
            return this.inboxService.ContractReceivedOnInbox(
                dataDto.contractId,
                dataDto.receiverUsername,
                dataDto.accepted,
            )
        }

}
