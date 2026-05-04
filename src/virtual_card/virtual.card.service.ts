import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CARDTYPE, VirtualCard } from './entity/virtual.card.entity';
import { JwtService } from '@nestjs/jwt';
import { AccountDocument } from 'src/account/document/account.doc';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';





@Injectable()
export class VirtualCardService {
    constructor( 
        @InjectRepository(VirtualCard) private readonly vcRepository:Repository<VirtualCard>,
        @InjectModel('Account') private readonly accountModel:Model<AccountDocument>,
        private readonly jwtService:JwtService,
){}

    async account(id:string){

        const account = await this.accountModel.findById(id).exec()
        if ( ! account ) throw new NotFoundException('{virtual card} account not found')
        
        return { 
            expDate: account.expiry,
            pan: account.pan,
        }
    }

    async createMainCard(
        fullName:string,
        id:any
    ){
        const pan = Math.floor(Math.random() * 10000000000000000 ).toString()
        const CVC = Math.floor(Math.random() * 1000 ).toString()
        const account = await this.account(id)
        const expiryDate = account.expDate
       
      
      
        return this.vcRepository.create({

            card_type: CARDTYPE.MAIN,
            full_name: fullName,
            pan: pan,
            CVC: CVC,
            expiry: expiryDate,
            billing_address: '26, LONDON STREET, LEEDS, L20 3FX'

        })
    }

    async createTempCard(

        fullName: string,
        expiryTime: string,
        senderAccountId: string,
        accountUsers: string[],
    ){

        const CVC = Math.floor(Math.random() * 1000 ).toString();
        const account = await this.account(senderAccountId);
        const expiryDate = account.expDate;
        const pan = account.pan;

        const tempCard = this.vcRepository.create({
            card_type: CARDTYPE.TEMP,
            full_name: fullName,
            pan: pan,
            CVC: CVC,
            expiry: expiryDate,
            expiry_time: expiryTime,
            billing_address: '26, LONGWAY ROAD, MANCHESTER, M13 19XD',
            account_users: accountUsers,
        });

        return this.vcRepository.save(tempCard);
    }

    cardQRCode(pan:string,expiry:string){

        const token = this.jwtService.sign({
            pan:pan,expiry:expiry
        })
    }
    
}
