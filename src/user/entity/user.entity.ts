import { Entity,PrimaryGeneratedColumn, Column, OneToMany,JoinColumn } from "typeorm";
import { Account } from "src/account/entity/account.entity";
import { OneToOne } from "typeorm/browser";
import { Inbox } from "src/inbox/entity/inbox.entity";


export enum Role {
    USER = "user",
    ADMIN = "admin",
}

export enum UserType {
    DEFAULT = "default",
    COMPETED = "completed",
}
@Entity("User")
export class User {

    @PrimaryGeneratedColumn('uuid')
        id:string;

    @Column({
        type:"enum",
        enum: Role,
        default:Role.USER,
        })
        role:Role

    @Column({
        type:'enum',
        enum:UserType,
        default:UserType.DEFAULT
    })
        user_type: UserType

    @Column( 'varchar', { length:10 , default: 'John' })
        name:string;

    @Column( 'varchar', { length:10 , default: 'James' })
        surname:string;

    @Column( 'integer', { default:123435673 } )
        mobile_number: number

    @Column( 'varchar', { length:12 ,default: 'JoJames2345' } )
        user_name:string;

    @Column('varchar', { length:30 , default: 'JohnJames100@email.com' })
        email:string;

    @Column( 'varchar', { default: 'Passwordxmx0'} )
        password:string;  
    
    @OneToMany( ()=>Account,accounts => accounts.user )
        accounts:Account[]

    @OneToOne( ()=> Inbox,inbox => inbox.user )
        @JoinColumn()
        inbox: Inbox
}