import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract, SPLIT_AGREEMENT, CONTRACT_STATUS } from './entity/contract.entity';
import { Repository } from 'typeorm';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { Role, User } from 'src/user/entity/user.entity';
import { Account } from 'src/account/entity/account.entity';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from 'src/user/signUp.signIn/registerDto';
import { UserType } from 'src/user/entity/user.entity';
import { InboxService } from 'src/inbox/inbox.service';



export interface contractProps{

    sender: string,
    receiver: string,
    split_agreement: SPLIT_AGREEMENT,
    transaction:Transaction,
    contractStatus:CONTRACT_STATUS,
    repayment_agreement?:string,
    event_agreement?:string,
    location_agreement?:string,
    time_agreement?:string

} 
@Injectable()
export class ContractService {

    constructor( 
        @InjectRepository( Contract ) private readonly contractRepository:Repository<Contract>,
        @InjectRepository( User ) private readonly userRepository:Repository<User>,
        @InjectRepository( Account ) private readonly accountRepository:Repository<Account>,
        private readonly userService: UserService,
        private readonly inboxService: InboxService,


 ){}



    async sendContract(contract:any,registerDto:Partial<RegisterDto>){

        if (!contract.repayment_agreement) throw new NotFoundException( 'repayment agreement not established');
        if (!contract.event_agreement) throw new NotFoundException( 'event agreement not established');
        if (!contract.location_agreement) throw new NotFoundException( 'location agreement not established');
        if (!contract.time_agreement) throw new NotFoundException( 'time agreement not established');

        const contractPayload = {
            sender: contract.sender,
            receiver: contract.receiver,
            split_agreement: contract.split_agreement,
            transaction:contract.transactions,
            contractStatus: contract.contract_status,
            repayment_agreement:contract.repayment_agreement,
            event_agreement: contract.event_agreement,
            location_agreement: contract.location_agreement,
            time_agreement:contract.time_agreement
        };
        
        const contractCreated = await this.contractRepository.create(contractPayload)
        await this.contractRepository.save(contractCreated)

        const receiverUser = await this.userRepository.findOne( { where: { user_name: contractPayload.receiver }})
        if ( ! receiverUser ){
            const randomFour = Math.floor(Math.random() * 100000) 
            const password = crypto.randomUUID();

            const defaultUser = await this.userService.createUser({
                                role:Role.USER,
                                name:registerDto.name,
                                surname:registerDto.surname,
                                userName: `default_user${randomFour}`,
                                mobileNumber:registerDto.mobileNumber,
                                userType:UserType.DEFAULT,
                                email:registerDto.email,
                                password:password,
                                confirmPassword: password
                            })
            
            await this.userRepository.save(defaultUser)
            /* scan qr code to activate dummy account */


                }else{
                    
                    return this.inboxService.postInbox(contractCreated ,receiverUser)
                }
                    
        }

    }

