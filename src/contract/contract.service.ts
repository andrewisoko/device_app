import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contract, ContractDocument, SPLIT_AGREEMENT, CONTRACT_STATUS } from './document/contract.doc';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { Role, User } from 'src/user/entity/user.entity';
import { Account } from 'src/account/document/account.doc';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from 'src/user/signUp.signIn/registerDto';
import { UserType } from 'src/user/entity/user.entity';
import { InboxService } from 'src/inbox/inbox.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';



export interface contractProps{

    sender: string,
    receiver: string[],
    split_agreement: SPLIT_AGREEMENT,
    transactions?: Types.ObjectId[] | string[],
    contractStatus:CONTRACT_STATUS,
    sender_percentage?: number;
    sender_amount?: number;
    receiver_percentage?: number[];
    receiver_amount?: number[];
    repayment_agreement?:string,
    event_agreement?:string,
    location_agreement?:string,
    time_agreement?:string

} 
@Injectable()
export class ContractService {

    constructor( 
        @InjectModel('Contract') private readonly contractModel: Model<ContractDocument>,
        @InjectRepository( User ) private readonly userRepository:Repository<User>,
        private readonly userService: UserService,
        private readonly inboxService: InboxService,
 ){}



    async sendContract( contract:contractProps, registerDto:Partial<RegisterDto> ){

        const contractPayload = {
            
            sender: contract.sender,
            sender_percentage:contract.sender_percentage,
            sender_amount:contract.sender_amount,
            receiver: contract.receiver,
            receiver_percentage:contract.receiver_percentage,
            receiver_amount:contract.receiver_amount,
            split_agreement: contract.split_agreement,
            transactions: contract.transactions,
            contract_status: contract.contractStatus,
            repayment_agreement: contract.repayment_agreement,
            event_agreement: contract.event_agreement,
            time_agreement: contract.time_agreement,
            location_agreement: contract.location_agreement,
        };
        
        const contractCreated = await this.contractModel.create(contractPayload);

        // Handle multiple receivers
        for (const receiverName of contractPayload.receiver) {
            const receiverUser = await this.userRepository.findOne( { where: { user_name: receiverName }})
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
                await this.inboxService.postInbox(contractCreated ,receiverUser)
            }
        }
                    
    }

    }

