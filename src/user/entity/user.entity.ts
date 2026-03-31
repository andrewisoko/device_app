import { Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity("User")
export class User {

     @PrimaryGeneratedColumn('uuid')
        id:string

}