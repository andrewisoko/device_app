import { User } from "src/user/entity/user.entity";
import { Entity,PrimaryGeneratedColumn,Column, ManyToOne,CreateDateColumn } from "typeorm";

export enum STATUS {

    ACTIVE = "active",
    INACTIVE = 'Inactive',
    SUSPENDED = 'Suspended',
    CLOSE  = 'Closed',
    PENDING = 'Pending',
}

@Entity("Account")
export class Account {

    @PrimaryGeneratedColumn('uuid')
        id:string;
    
    @Column( { type:'integer', length:16, default: 1234567890123456} )
        accountNumber:number;

    @Column( 'decimal', { default:0 } )
        balance:number;

    @Column('varchar', { length:3 , default:'GBP' } )
        currency:string;

    @Column({
        type:'enum',
        enum:STATUS,
        default:STATUS,
    })
        status:STATUS;
    
    

    @CreateDateColumn( { name:'timestamp' } )
        updatedAt:Date;
    
    @ManyToOne( ()=> User,user => user.accounts )
        user:User   
}