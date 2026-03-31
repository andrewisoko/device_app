import { Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity("Contract")
export class Contract {

     @PrimaryGeneratedColumn('uuid')
        id:string

}