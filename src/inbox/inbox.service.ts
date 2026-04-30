import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inbox } from './entity/inbox.entity';
import { User } from 'src/user/entity/user.entity';
import { Contract, CONTRACT_STATUS } from 'src/contract/entity/contract.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class InboxService {

    constructor(
        @InjectRepository( Inbox ) private readonly inboxRepository: Repository<Inbox>,
        @InjectRepository( User ) private readonly userRepository: Repository<User>,
        @InjectRepository( Contract ) private readonly contractRepository: Repository<Contract>,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    
    private parseTimeAgreement(value: any): string[] {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
            // PostgreSQL array literal: {"val1","val2"}
            const match = value.match(/^\{(.*)\}$/s);
            if (match) {
                return match[1]
                    .split(',')
                    .map(s => s.replace(/^"|"$/g, '').trim())
                    .filter(Boolean);
            }
            return value.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
        };
    
    async postInbox(contract:Contract,user:User){

        try{
            
            const contractSnapshot: Partial<Contract> = {
                id: contract.id,
                sender: contract.sender,
                receiver: contract.receiver,
                split_agreement: contract.split_agreement,
                contract_status: contract.contract_status,
                time_agreement: contract.time_agreement,
                sender_percentage: contract.sender_percentage,
                receiver_percentage: contract.receiver_percentage,
                sender_amount: contract.sender_amount,
                receiver_amount: contract.receiver_amount,
                repayment_agreement: contract.repayment_agreement,
                event_agreement: contract.event_agreement,
                location_agreement: contract.location_agreement,
                createdAt: contract.createdAt,
                updatedAt: contract.updatedAt,
            };
    
            const existingInbox = await this.inboxRepository.findOne({
                where: { user: { id: user.id } },
            });
    
            if (existingInbox) {
                const existingHistory = Array.isArray(existingInbox.history) ? existingInbox.history : [];
    
                existingInbox.history = [...existingHistory, contractSnapshot];
                existingInbox.mostRecent = [contractSnapshot];
                existingInbox.contract = contract;
                existingInbox.user = user;
    
                return await this.inboxRepository.save(existingInbox);
            }
    
            const inboxPayload = this.inboxRepository.create({
                history:[contractSnapshot],
                mostRecent:[contractSnapshot],
                contract:contract,
                user:user,
            });
    
            return await this.inboxRepository.save(inboxPayload)
        }catch(error){
            console.log('error at postInbox service level', error)
        }
        
        
    };


    async ContractReceivedOnInbox( contractId: string, receiverId: string, accepted:boolean ){

        let inboxReceiver;

        try {
            
            if (!contractId || !receiverId) {
                throw new BadRequestException('contractId and receiverUsername are required');
            };
    
            
            const receiverUser = await this.userRepository.findOne({
                where: { id: receiverId as string },
                relations: ['inbox'],
            });
    
            if (!receiverUser) {
                throw new NotFoundException('Receiver user not found');
            };
    
            const contract = await this.contractRepository.findOne({ where: { id: contractId } });
    
            if (!contract) {
                throw new NotFoundException('Contract not found');
            };
    
            const receivers = Array.isArray(contract.receiver) ? contract.receiver : [];
            if (!receivers.includes(receiverId as string)) {
                throw new UnauthorizedException('Receiver is not a participant in this contract');
            };

            contract.contract_status = accepted ? CONTRACT_STATUS.ACCEPTED : CONTRACT_STATUS.DECLINED;

            const contractDecision = await this.contractRepository.save(contract);
            inboxReceiver = receiverUser.inbox
                ? await this.inboxRepository.findOne({ where: { id: receiverUser.inbox.id } })
                : null;
    
            if (inboxReceiver) {
                const decisionSnapshot: Partial<Contract> = {
                    id: contractDecision.id,
                    sender: contractDecision.sender,
                    receiver: contractDecision.receiver,
                    split_agreement: contractDecision.split_agreement,
                    contract_status: contractDecision.contract_status,
                    time_agreement: contractDecision.time_agreement,
                    sender_percentage: contractDecision.sender_percentage,
                    receiver_percentage: contractDecision.receiver_percentage,
                    sender_amount: contractDecision.sender_amount,
                    receiver_amount: contractDecision.receiver_amount,
                    repayment_agreement: contractDecision.repayment_agreement,
                    event_agreement: contractDecision.event_agreement,
                    location_agreement: contractDecision.location_agreement,
                    createdAt: contractDecision.createdAt,
                    updatedAt: contractDecision.updatedAt,
                };
    
            const existingHistory = Array.isArray(inboxReceiver.history) ? inboxReceiver.history : [];
            inboxReceiver.history = [...existingHistory, decisionSnapshot];
            inboxReceiver.mostRecent = [decisionSnapshot];
            inboxReceiver.contract = contractDecision;
            inboxReceiver.user = receiverUser;
    
    
            //------------------//
            //------------------//
            //------------------//
            //User decison here //
            //------------------//
            //------------------//
            //------------------//
    
    
            if( accepted === true){
       
                await this.inboxRepository.save(inboxReceiver);
                };
    
                const gatewayUrl = this.configService.get<string>( 'CONTRACT_GATEWAY_URL' ); 
                if( !gatewayUrl ) throw new NotFoundException('gateway url not found' );
    
                const contractKey = this.configService.get<string>('CONTRACT_KEY');
                if( !contractKey ) throw new NotFoundException('contractKey not found' );
    
                const bearerToken = this.createContractToken(
                    contractKey,
                    receiverId,
                    contractDecision.id,
                    {
                        account: Array.isArray(receiverUser.accounts) ? receiverUser.accounts[0] : undefined,
                        role: "contract",
                    },
                );

                const response = await firstValueFrom(
                this.httpService.post(
                    gatewayUrl,
                    {
                        contractId: contractDecision.id,
                        sender: contractDecision.sender,
                        receiver: contractDecision.receiver,
                        split_agreement: contractDecision.split_agreement,
                        contractStatus: contractDecision.contract_status,
                        time_agreement: this.parseTimeAgreement(contractDecision.time_agreement),
                        sender_percentage: Number(contractDecision.sender_percentage),
                        receiver_percentage: Array.isArray(contractDecision.receiver_percentage)
                            ? contractDecision.receiver_percentage.map(Number)
                            : [],
                        sender_amount: Number(contractDecision.sender_amount),
                        receiver_amount: Array.isArray(contractDecision.receiver_amount)
                            ? contractDecision.receiver_amount.map(Number)
                            : [],
                        repayment_agreement: contractDecision.repayment_agreement,
                        event_agreement: contractDecision.event_agreement,
                        location_agreement: contractDecision.location_agreement,
                        acceptedBy: receiverId,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${bearerToken}`,
                                     },
                            },
                        ),
                    );
    
                return {
                    message: 'Contract accepted and forwarded to gateway',
                    contractId: contractDecision.id,
                    contractStatus: contractDecision.contract_status,
                    forwardedTo: gatewayUrl,
                    gatewayResponse: response.data,
                };
    
            }else{
                await this.inboxRepository.save(inboxReceiver);
    
                      return {
                    message: 'Contract declined from receiver user',
                    contractId: contractDecision.id,
                    contractStatus: contractDecision.contract_status,
                    forwardedTo: null,
                    gatewayResponse: null,
                };
               
            };
           
        } catch (error) {
            console.log('Error at conctract received on inbox level', error)
        }

    };


    private createContractToken(
        contractKey: string,
        receiverUsername: string,
        contractId: string,
        certPayload: { account?: string; role?: string },
    ) {
        return this.jwtService.sign(
            {
                sub: receiverUsername,
                contractId,
                scope: 'contract:forward',
                account: certPayload.account,
                role: certPayload.role,
            },
            {
                secret: contractKey,
                expiresIn: '5m',
            },
        );
    }
}
