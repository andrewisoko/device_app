import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { Inbox } from 'src/inbox/entity/inbox.entity';



export enum SPLIT_AGREEMENT {
    PERCENTAGE = 'percentage',
    AMOUNT = 'amount',
}

export enum CONTRACT_STATUS {
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    FAILED = 'failed',
    PENDING = 'pending',
}

@Entity('contract')
export class Contract {

    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar' })
        sender: string;

    @Column({ type: 'simple-array' })
        receiver: string[];

    @Column({ type: 'enum', enum: SPLIT_AGREEMENT, default: SPLIT_AGREEMENT.AMOUNT })
        split_agreement: SPLIT_AGREEMENT;

    @Column({ type: 'enum', enum: CONTRACT_STATUS, default: CONTRACT_STATUS.PENDING })
        contract_status: CONTRACT_STATUS;
        
    @Column('varchar', { default: ["2026-04-18T12:00:00Z", "2026-04-18T15:00:00Z" ] })
        time_agreement: Date[]

    @Column({ type: 'numeric', default: 50 })
        sender_percentage: number;

    @Column({ type: 'simple-array', nullable: true })
        receiver_percentage: number[];

    @Column({ type: 'numeric', default: 0 })
        sender_amount: number;

    @Column({ type: 'simple-array', nullable: true })
        receiver_amount: number[];

    @Column({ type: 'varchar', nullable: true })
        repayment_agreement: string;

    @Column({ type: 'varchar', nullable: true })
        event_agreement: string;

    @Column({ type: 'varchar', nullable: true })
        location_agreement: string;

    @OneToMany(() => Transaction, transaction => transaction.contract)
        transactions: Transaction[];

    @OneToOne(() => Inbox, inbox => inbox.contract)
        inbox: Inbox;

    @CreateDateColumn({ name: 'created_at' })
        createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
        updatedAt: Date;
}
