import { Entity,PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Account } from "src/account/entity/account.entity";

@Entity("User")
export class User {

    @PrimaryGeneratedColumn('uuid')
        id:string;

    @Column( 'varchar', { length:50 , default: 'John James' })
        fullName:string;

    @Column( 'varchar', { length:12 , default: 'JoJames' } )
        userName:string;

    @Column('varchar', { length:30 , default: 'JohnJames100@email.com' })
        email:string;

    @Column( 'varchar', { default: 'Passwordxmx0'} )
        password:string;  
    
    @OneToMany( ()=>Account,accounts => accounts.user )
        accounts:Account[]
}