import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Contract, SPLIT_AGREEMENT, CONTRACT_STATUS } from './entity/contract.entity';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { Role, User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from 'src/user/signUp.signIn/registerDto';
import { UserType } from 'src/user/entity/user.entity';
import { InboxService } from 'src/inbox/inbox.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { AccountDocument } from 'src/account/document/account.doc';
import { Model } from 'mongoose';




export interface contractProps{

    sender: string,
    receiver: string[],
    split_agreement: string,
    contractStatus: string,
    time_agreement:Date[]
    sender_percentage: number;
    sender_amount: number;
    receiver_percentage: number[];
    receiver_amount: number[];
    repayment_agreement:string,
    event_agreement:string,
    location_agreement:string,

} 
@Injectable()
export class ContractService {

    constructor( 
        @InjectRepository( Contract ) private readonly contractRepository: Repository<Contract>,
        @InjectRepository( User ) private readonly userRepository:Repository<User>,
        @InjectModel('Account') private readonly accountModel:Model<AccountDocument>,
        private readonly userService: UserService,
        private readonly inboxService: InboxService,
 ){}





    async sendContract( contract:Partial<contractProps>, registerDto:Partial<RegisterDto> ){

        // const receiverIds: MongoId[] = parseMongoIds(contract.receiver ?? []);

        const senderUser = await this.userRepository.findOne({where:{user_name:contract.sender}});
        if( ! senderUser ) throw new NotFoundException("error at send contract level 404: sender user not found")
        const senderAccountId = senderUser.accounts[0];


        let receiverAccountIds :string[] = [];

        for ( const usernames of contract.receiver?? []){
            const receiverUser = await this.userRepository.findOne({where:{user_name:usernames}})
            if(! receiverUser ) throw new NotFoundException("error at send contract level 404: receiver user not found")

            receiverAccountIds.push(String(receiverUser.accounts[0]))
        }
     

        const contractPayload = this.contractRepository.create({
            sender: senderAccountId,
            sender_percentage:contract.sender_percentage,
            sender_amount:contract.sender_amount,
            receiver: receiverAccountIds,
            time_agreement: contract.time_agreement,
            receiver_percentage:contract.receiver_percentage,
            receiver_amount:contract.receiver_amount,
            split_agreement: contract.split_agreement as SPLIT_AGREEMENT,
            contract_status: contract.contractStatus as CONTRACT_STATUS,
            repayment_agreement: contract.repayment_agreement,
            event_agreement: contract.event_agreement,
            location_agreement: contract.location_agreement,
        });
        
        const contractCreated = await this.contractRepository.save(contractPayload);

        // Handle multiple receivers
        for (const receiverAccountId of contractCreated.receiver) {

            const receiverAccountUser = await this.accountModel.findById(receiverAccountId).exec();
            if (!receiverAccountUser) {
                continue;
            }

            const receiverUser = await this.userRepository.findOne({ where: { id: String(receiverAccountUser.customer) } });
          
            if ( ! receiverUser ){

                console.log('rec user inexistent',receiverUser)
                // const randomFour = Math.floor(Math.random() * 100000) 
                // const password = crypto.randomUUID();

                // const defaultUser = await this.userService.createUser({
                //                     role:Role.USER,
                //                     name:registerDto.name,
                //                     surname:registerDto.surname,
                //                     userName: `default_user${randomFour}`,
                //                     mobileNumber:registerDto.mobileNumber,
                //                     userType:UserType.DEFAULT,
                //                     email:registerDto.email,
                //                     password:password,
                //                     confirmPassword: password
                //                 })
                
                // await this.userRepository.save(defaultUser)
                /* scan qr code to activate dummy account */
            }else{
                await this.inboxService.postInbox(contractCreated ,receiverUser)
            }
        }

        return 'contract sent to receivers.'
                    
    }

    }

