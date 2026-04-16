import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

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

@Schema({ timestamps: true })
export class Contract extends Document {
    @Prop({ type: String, required: true })
        sender: string;

    @Prop({ type: [String], required: true })
        receiver: string[];

    @Prop({ type: Number, required:false, default: 50 })
        sender_percentage: number;

    @Prop({ type: Number, required:false, default: 50 })
        receiver_percentage: number;

    @Prop({ type: Number, required:false, defaul: 5 })
        sender_amount: number;

    @Prop({ type: Number, required:false, default: 5 })
        receiver_amount: number 

    @Prop({
        type: String,
        enum: SPLIT_AGREEMENT,
        default: SPLIT_AGREEMENT.AMOUNT,
    })
        split_agreement: SPLIT_AGREEMENT;
    @Prop({
        type: String,
        enum: CONTRACT_STATUS,
        default: CONTRACT_STATUS.PENDING,
    })
        contract_status: CONTRACT_STATUS;

    @Prop({ type: String , required:false })
        repayment_agreement: string;

    @Prop({ type: String, required:false })
        event_agreement: string;

    @Prop({ type: String, required:false })
        location_agreement: string;

    @Prop({ type: String, required:false })
        time_agreement: string;

    @Prop({ type: [Types.ObjectId], ref: 'Transaction', default: [] })
        transactions: Types.ObjectId[];

    @Prop({ type: Date, default: Date.now })
        createdAt: Date;

    @Prop({ type: Date })
        updatedAt: Date;
}

export type ContractDocument = HydratedDocument<Contract>;
export const ContractSchema = SchemaFactory.createForClass(Contract);
