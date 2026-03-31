import { Entity,PrimaryGeneratedColumn } from "typeorm";


@Entity("Account")
export class Account {

    @PrimaryGeneratedColumn('uuid')
    id:string
}