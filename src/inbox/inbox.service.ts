import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { Inbox } from './entity/inbox.entity';
import { User } from 'src/user/entity/user.entity';
import { Contract, CONTRACT_STATUS, CONTRACT_TYPE } from 'src/contract/entity/contract.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { Account, AccountDocument } from 'src/account/document/account.doc';
import { ObjectId } from 'typeorm/browser';
import { VirtualCard } from 'src/virtual_card/entity/virtual.card.entity';
import { VirtualCardService } from 'src/virtual_card/virtual.card.service';


@Injectable()
export class InboxService {

    constructor(
        @InjectRepository( Inbox ) private readonly inboxRepository: Repository<Inbox>,
        @InjectRepository( User ) private readonly userRepository: Repository<User>,
        @InjectRepository( Contract ) private readonly contractRepository: Repository<Contract>,
        @InjectRepository( VirtualCard ) private readonly vcRepository: Repository<VirtualCard>,
        @InjectModel('Account') private readonly accountModel: Model<AccountDocument>,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly virtualCardService: VirtualCardService,
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
                created_at: contract.created_at,
                updated_at: contract.updated_at,
            };
    
            const existingInbox = await this.inboxRepository.findOne({
                where: { user: { id: user.id } },
            });
    
            if (existingInbox) {
                const existingHistory = Array.isArray(existingInbox.history) ? existingInbox.history : [];
    
                existingInbox.history = [...existingHistory, contractSnapshot];
                existingInbox.most_recent = [contractSnapshot];
                existingInbox.contract = contract;
                existingInbox.user = user;
    
                return await this.inboxRepository.save(existingInbox);
            }
    
            const inboxPayload = this.inboxRepository.create({
                history:[contractSnapshot],
                most_recent:[contractSnapshot],
                contract:contract,
                user:user,
            });
    
            return await this.inboxRepository.save(inboxPayload)
        }catch(error){
            console.log('error at postInbox service level', error)
        }
        
        
    };


    async ContractReceivedOnInbox( contractId: string, receiverAccountId: string, accepted:boolean ){

        try {

            if (!contractId || !receiverAccountId) {
                throw new BadRequestException('contractId and receiverUsername are required');
            }

            const receiverAccountUser = await this.accountModel.findById(receiverAccountId).exec();
            if (!receiverAccountUser) throw new NotFoundException('Receiver account not found');

            const receiverUser = await this.userRepository.findOne({
                where: { id: String(receiverAccountUser.customer) },
                relations: ['inbox'],
            });
            if (!receiverUser) throw new NotFoundException('Receiver user not found');

            const contract = await this.contractRepository.findOne({ where: { id: contractId } });
            if (!contract) throw new NotFoundException('Contract not found');

            contract.contract_status = accepted ? CONTRACT_STATUS.ACCEPTED : CONTRACT_STATUS.DECLINED;
            const contractDecision = await this.contractRepository.save(contract);

            const inboxReceiver = receiverUser.inbox
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
                    created_at: contractDecision.created_at,
                    updated_at: contractDecision.updated_at,
                };

                const existingHistory = Array.isArray(inboxReceiver.history) ? inboxReceiver.history : [];
                inboxReceiver.history = [...existingHistory, decisionSnapshot];
                inboxReceiver.most_recent = [decisionSnapshot];
                inboxReceiver.contract = contractDecision;
                inboxReceiver.user = receiverUser;

                //------------------//
                //  User decision   //
                //------------------//

                if (accepted === true) {

                    await this.inboxRepository.save(inboxReceiver);

                    contract.contract_type = CONTRACT_TYPE.EXISTING_USER;
                    await this.contractRepository.save(contract);

                    // Build temp card for all contract participants
                    const senderAccount = await this.accountModel.findById(contractDecision.sender).exec();
                    if (senderAccount) {
                        const senderUser = await this.userRepository.findOne({ where: { id: String(senderAccount.customer) } });
                        const fullName = senderUser ? `${senderUser.name} ${senderUser.surname}` : senderAccount.fullName;
                        const accountUsers = [contractDecision.sender, ...contractDecision.receiver];
                        const expiryTime = Array.isArray(contractDecision.time_agreement)
                            ? String(contractDecision.time_agreement[1])
                            : this.parseTimeAgreement(contractDecision.time_agreement)[1] ?? '';
                        await this.virtualCardService.createTempCard(fullName, expiryTime, contractDecision.sender, accountUsers);
                    }

                    const gatewayUrl = this.configService.get<string>('CONTRACT_GATEWAY_URL');
                    if (!gatewayUrl) throw new NotFoundException('gateway url not found');

                    const contractKey = this.configService.get<string>('CONTRACT_KEY');
                    if (!contractKey) throw new NotFoundException('contractKey not found');

                    const bearerToken = this.createContractToken(
                        contractKey,
                        receiverUser.id,
                        contractDecision.id,
                        { account: contractDecision.sender, role: 'contract' },
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
                                acceptedBy: receiverUser.id,
                            },
                            { headers: { Authorization: `Bearer ${bearerToken}` } },
                        ),
                    );

                    return {
                        message: 'Contract accepted and forwarded to gateway',
                        contractId: contractDecision.id,
                        contractStatus: contractDecision.contract_status,
                        forwardedTo: gatewayUrl,
                        gatewayResponse: response.data,
                    };

                } else if( accepted === false && contract.contract_type === CONTRACT_TYPE.ONE_TIME ){

                    await this.inboxRepository.save(inboxReceiver);
                    const accountDefaultReceiver = await this.accountModel.findById(contract.receiver[0]).exec();
                    if( ! accountDefaultReceiver ) throw new NotFoundException( 'account of default user not found');

                    const userDefault = await this.userRepository.findOne({
                        where: { id: String(accountDefaultReceiver.customer) },
                        relations: ['inbox'],
                    });
                    if( ! userDefault ) throw new NotFoundException( 'default user not found');
                    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

                    await this.accountModel.deleteOne(accountDefaultReceiver);
                    console.log("default user bank account deleted");

                    if (accountDefaultReceiver.mainVirtualCard && isValidUuid.test(String(accountDefaultReceiver.mainVirtualCard))) {
                        await this.vcRepository.delete(String(accountDefaultReceiver.mainVirtualCard));
                        console.log("default user virtual card deleted");
                    }

                    // Nullify the inbox FK on the user row before deleting inbox
                    if (userDefault.inbox?.id) {
                        const inboxId = userDefault.inbox.id;
                        userDefault.inbox = null as unknown as Inbox;
                        await this.userRepository.save(userDefault);
                        await this.inboxRepository.delete(inboxId);
                        console.log("default user inbox deleted");
                    }

                    await this.userRepository.delete(accountDefaultReceiver.customer);
                    console.log("default user deleted");

                    console.log(`All Default user ${ accountDefaultReceiver.customer } data succesfully deleted after contract declined`);
                   

                    return {
                        message: 'Contract declined from new prospect receiver user',
                        contractId: contractDecision.id,
                        contractStatus: contractDecision.contract_status,
                        forwardedTo: null,
                        gatewayResponse: null,
                    };
                } else {

                      await this.inboxRepository.save(inboxReceiver);

                      return {
                        message: 'Contract declined from receiver user',
                        contractId: contractDecision.id,
                        contractStatus: contractDecision.contract_status,
                        forwardedTo: null,
                        gatewayResponse: null,
                    };

                }
            }

        } catch (error) {
            console.log('Error at contract received on inbox level', error);
        }
    }


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
