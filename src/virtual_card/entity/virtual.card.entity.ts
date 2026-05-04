import { User } from "src/user/entity/user.entity";
import { Entity,PrimaryGeneratedColumn,Column,OneToMany } from "typeorm";
;

export enum CARDTYPE {

        MAIN = 'main',
        TEMP = 'temporary'
}

@Entity("virtual_card")
export class VirtualCard {

        @PrimaryGeneratedColumn('uuid')
                id:string;

        @Column({
                type: 'enum',
                enum: CARDTYPE,
                default: CARDTYPE.MAIN
        })
                card_type: CARDTYPE

        @Column({ type:'text', default: 'Full Name' })
                full_name:string;

        @Column()
                pan:string;

        @Column()
                CVC: string;
        
        @Column()
                expiry: string;

        @Column({ nullable:true })
                expiry_time: string;

        @Column({ type:'text', default: '26, LONDON STREET, LEEDS, L20 3FX' })
                billing_address: string;

        @Column('varchar',{length:50, default:["550e8400-e29c-41d4-a715-446655440000"]})
                account_users:string[]
      


}