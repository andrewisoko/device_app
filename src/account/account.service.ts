import {  ForbiddenException, Injectable, NotFoundException,UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account,STATUS } from './entity/account.entity';
import { User } from 'src/user/entity/user.entity';
// import { AuthService } from '../auth/auth.service';
import { UserService } from 'src/user/user.service';




@Injectable()
export class AccountService {
    constructor(@InjectRepository(Account) private accountRepository:Repository<Account>,
                @InjectRepository(User) private userRepository:Repository<User>,
                // private authService:AuthService,
                private userService:UserService
    ){}


    async createAccount(currency:string,balance:number,username:string):Promise<Account>{ 

        const user = await this.userRepository.findOneBy({ userName: username });

        if(!user) throw new NotFoundException("user not found")

        const accNumber = Math.floor(Math.random() * 1000000000 ) /* to check */
        console.log(accNumber)
        
        const userAccount = await this.accountRepository.create({

            accountNumber:accNumber,
            currency:currency,
            balance: balance,
            user:user,
            status:STATUS.ACTIVE,
            createdAt: new Date()

        })
        return this.accountRepository.save(userAccount)
    }

    async findAllAccounts(email): Promise<Account[]> {

        const validUser = await this.userService.findUserByEmail(email)
        if (!validUser) {
            throw new UnauthorizedException('Invalid email');
        }

        const userWithAccounts = await this.userRepository.findOne({
            where: { id: validUser.id},
            relations: ['accounts']
        });

        if (!userWithAccounts || !userWithAccounts.accounts) {
            return [];
        }
        return userWithAccounts.accounts;
        }


    async retrieveAccount(
        userNameClient: string,
        accountNumber: number
        ): Promise<any> {

        const user = await this.userRepository.findOne({
            where: { userName: userNameClient }
        });
        if (!user) throw new NotFoundException('User not found');

        const userName = user.userName
 

        const account = await this.accountRepository.findOne({
            where: { accountNumber }
        });
        if (!account) throw new NotFoundException('Account not found');

        const response = {
            account,
            userName,
        };

  return response;
}


async deleteAccount(accountId:string, password:string, username:string){

    const account = await this.accountRepository.findOne
    ({where:{id:accountId},
        relations:["user"]})
    if (!account) throw new NotFoundException("account not found");

    
    if (account.user.userName !== username) throw new UnauthorizedException("You do not own this account");
    if(account.balance > 0) throw new UnauthorizedException("Balance must be zero for account to be deleted.");
    if (account.status === "Pending") throw new UnauthorizedException("Account still pending.");
    
    const pendingTransaction = await this.accountRepository.createQueryBuilder("acc")
                                .leftJoin('acc.outgoingTransactions', 'txOut')
                                .leftJoin('acc.incomingTransactions', 'txIn')
                                .select([
                                    "acc.accountID",
                                    "txOut.status",
                                    "txIn.status"
                                ])
                                .where("acc.accountID = :accountId",{accountId})
                                .andWhere('(txOut.status = :status OR txIn.status = :status)', { status: 'pending' })
                                .getOne()
    

    if(pendingTransaction) throw new UnauthorizedException("transaction still pending.");
    return this.accountRepository.delete(account)
    
    
}
    
    }


