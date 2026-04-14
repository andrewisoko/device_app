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

        const account = await this.accountModel.findOne({id:id}).exec()
        if ( ! account ) throw new NotFoundException('account date not found')
        
        return { 
            'expDate': account.expiry,
            'pan': account.pan
        }
    }

    async createMainCard(
        fullName:string,
        id:string
    ){
        const pan = Math.floor(Math.random() * 10000000000000000 ).toString()
        const CVC = Math.floor(Math.random() * 1000 ).toString()
        const account = await this.account(id)
        const expiryDate = account['expDate']
       
      
      
        return this.vcRepository.create({

            cardType:CARDTYPE.MAIN,
            fullName:fullName,
            pan: pan,
            CVC:CVC,
            expiry:expiryDate,
            billingAddress: '26, LONDON STREET, LEEDS, L20 3FX'

        })
    }

    async createTempCard( 

        fullName:string,
        expiryTime:string,
        id:string
    ){

        const CVC = Math.floor(Math.random() * 1000 ).toString();
        const account = await this.account(id);
        const expiryDate = account['expiryDate'];
        const pan = account['pan'];

            return this.vcRepository.create({

            cardType:CARDTYPE.TEMP,
            fullName:fullName,
            pan: pan,
            CVC:CVC,
            expiry:expiryDate,
            expiryTime: expiryTime,
            billingAddress: '26, LONGWAY ROAD, MANCHESTER, M13 19XD'

        })

    }

    cardQRCode(pan:string,expiry:string){

        const token = this.jwtService.sign({
            pan:pan,expiry:expiry
        })
    }
    
}
