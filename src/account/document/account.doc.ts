import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

export enum ACCOUNT_STATUS {
    ACTIVE = "active",
    INACTIVE = 'Inactive',
    SUSPENDED = 'Suspended',
    CLOSE = 'Closed',
    PENDING = 'Pending',
}

@Schema({ timestamps: true, collection: 'account' })
export class Account extends Document {


    @Prop({ type: String, default: 'Johnson Handsome' })
        fullName: string;
    
    @Prop({ type: Number, default: 12345678 })
        accountNumber: number;

    @Prop({type: String, default: '1234 7654 2345 0987' })
        pan:string;

    @Prop({ type: Number, precision: 15, scale: 2, default: 0 })
        ledger_balance: number;

    @Prop({ type: Number, precision: 15, scale: 2, default: 0 })
        available_balance: number;
    
    @Prop({ type: Number, precision: 15, scale: 2, default: 0 })
        hold: number;

    @Prop({ type: String, maxlength: 3, default: 'GBP' })
        currency: string;

    @Prop({ type: String, default: '99/33' })
         expiry: string;

    @Prop({
        type: String,
        enum: ACCOUNT_STATUS,
        default: ACCOUNT_STATUS.PENDING,
    })
        status: ACCOUNT_STATUS;

      @Prop({ type: String, default: 'default main card'})
          mainVirtualCard: string;

      @Prop({ type: [String], required:false, default: [] })
          tempVirtualCard: string[];
        
    @Prop({ type: [Types.ObjectId], ref: 'Transaction', default: [] })
        transactions: Types.ObjectId[];
    
    @Prop({ type: [Types.ObjectId], ref: 'Ledger', default: [] })
        ledgerEntries: Types.ObjectId[];
    
    @Prop({ type: Types.ObjectId, ref: 'User' })
        customer: Types.ObjectId;
    @Prop({ type: Date, default: Date.now })
        createdAt: Date;

    @Prop({ type: Date })
        updatedAt: Date;
}

export type AccountDocument = HydratedDocument<Account>;
export const AccountSchema = SchemaFactory.createForClass(Account);