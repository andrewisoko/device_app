import { Entity,PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Contract } from "src/contract/entity/contract.entity";


@Entity("transaction")
export class Transaction {

    @PrimaryGeneratedColumn('uuid')
        id:string;

    @Column('decimal', { precision: 6, scale: 2, default: 0 })
        available_balance:number;
    
    @Column( 'varchar', {default:'PENDING'} )
        status:string;
    
    @Column('decimal', { precision: 6, scale: 2, default: 0 } )
        amount:number;
    
    @CreateDateColumn({ name:'timestamp' })
         timestamp:Date

    @ManyToOne( () => Contract, contract => contract.transactions )
        contract:Contract
}