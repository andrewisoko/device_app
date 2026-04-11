import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CARDTYPE, VirtualCard } from './entity/virtual.card.entity';





@Injectable()
export class VirtualCardService {
    constructor( @InjectRepository(VirtualCard) private readonly vcRepository:Repository<VirtualCard>){}

    createExpiryDate(){

          const expiryDateMonth = () => { 
            const num =  Math.floor(Math.random() * 12 ).toString()
            if( num.length < 2){
                return '0'+ num
            }
            return num
        }
        const expiryDateYear = '36' 
        const expiryDate = expiryDateMonth + '/' + expiryDateYear

        return expiryDate
    }

    createMainCard(
        fullName:string
    ){
        const pan = Math.floor(Math.random() * 10000000000000000 ).toString()
        const CVC = Math.floor(Math.random() * 1000 ).toString()
        const expiryDate = this.createExpiryDate()
    
      
        return this.vcRepository.create({

            cardType:CARDTYPE.MAIN,
            fullName:fullName,
            pan: pan,
            CVC:CVC,
            expiry:expiryDate,
            billingAddress: '26, LONDON STREET, LEEDS, L20 3FX'

        })
    }

    createTempCard( 
         fullName:string,
         expiryTime:string,
    ){
        const pan = Math.floor(Math.random() * 10000000000000000 ).toString()
        const CVC = Math.floor(Math.random() * 1000 ).toString() 
        const expiryDate = this.createExpiryDate()

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

    
}
