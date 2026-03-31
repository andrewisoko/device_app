import { Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity("virtual_card")
export class VirtualCard {

     @PrimaryGeneratedColumn('uuid')
        id:string

}