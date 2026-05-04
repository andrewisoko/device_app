import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument, ACCOUNT_STATUS } from './document/account.doc';
import { User, UserType } from 'src/user/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VirtualCardService } from 'src/virtual_card/virtual.card.service';
import { VirtualCard } from 'src/virtual_card/entity/virtual.card.entity';


@Injectable()
export class AccountService {
    constructor(
        @InjectModel('Account') private accountModel: Model<AccountDocument>,
        @InjectRepository(User) private userRepository:Repository<User>,
        @InjectRepository(VirtualCard) private virtualCardRepository:Repository<VirtualCard>,
        private readonly virtualCardService:VirtualCardService,
    ){}


       createExpiryDate(){

          const expiryDateMonth = () => { 
            const num = Math.floor(Math.random() * 12) + 1;
            return num.toString().padStart(2, '0');
        }
        const expiryDateYear = '36' 
        const expiryDate = expiryDateMonth() + '/' + expiryDateYear

        return expiryDate
    }


    async createAccount(currency:string,balance:number,username:string ,fullName:string ):Promise<Account>{ 

        const user = await this.userRepository.findOneBy({ user_name: username });

        if(!user) throw new NotFoundException("create account:user not found")

        const accNumber = Math.floor(Math.random() * 1000000000 ) /* to check */
        const pan = Math.floor(Math.random() * 10000000000000000 ).toString()
         const expiryDate = this.createExpiryDate()
     
        
        const newAccount = await this.accountModel.create({

            accountNumber:accNumber,
            currency:currency,
            ledger_balance: balance,
            available_balance:balance,
            fullName:fullName,
            hold:0,
            pan:pan,
            expiry:expiryDate,
            customer: user.id,
            status: ACCOUNT_STATUS.ACTIVE,
            createdAt: new Date()
        });


        if (user.user_type !== UserType.DEFAULT) {
            const userVirtualCard = await this.virtualCardService.createMainCard(
                fullName,
                newAccount._id
            );

           newAccount.mainVirtualCard = userVirtualCard.id
           await this.virtualCardRepository.save(userVirtualCard)
        }

        return await newAccount.save();
    }

    async findAllAccounts(email: string): Promise<AccountDocument[]> {
        const validUser = await this.userRepository.findOne({ where: { email } });
        if (!validUser) {
            throw new UnauthorizedException('Invalid email');
        }

        const accounts = await this.accountModel
            .find({ user: validUser.id })
            .exec();

        if (!accounts || accounts.length === 0) {
            return [];
        }
        return accounts;
    }



    async retrieveAccount(
        userNameClient: string,
        accountNumber: number
        ): Promise<any> {

        const user = await this.userRepository.findOne({
            where: { user_name: userNameClient }
        });
        if (!user) throw new NotFoundException('receiver user not found');

        const account = await this.accountModel.findOne({ accountNumber }).exec();
        if (!account) throw new NotFoundException('Account not found');

        return {
            account,
            userName: user.user_name,
        };
    };

    async deleteAccount(accountId: string, password: string, username: string) {
        const account = await this.accountModel.findById(accountId).exec();
        if (!account) throw new NotFoundException("account not found");

        const user = await this.userRepository.findOne({ where: { user_name: username } });
        if (!user || account.customer.toString() !== user.id) {
            throw new UnauthorizedException("You do not own this account");
        }

        if (account.ledger_balance > 0 || account.available_balance > 0 || account.hold > 0) throw new UnauthorizedException("Balance must be zero for account to be deleted.");
        if (account.status === "Pending") throw new UnauthorizedException("Account still pending.");

        return this.accountModel.findByIdAndDelete(accountId).exec();
    }
}


