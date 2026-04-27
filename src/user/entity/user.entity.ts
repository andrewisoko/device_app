import { Entity,PrimaryGeneratedColumn, Column, OneToOne,JoinColumn,CreateDateColumn,UpdateDateColumn } from "typeorm";
import { OneToOne as TypeORMOneToOne } from "typeorm";
import { Inbox } from "src/inbox/entity/inbox.entity";


export enum Role {
    USER = "user",
    ADMIN = "admin",
}

export enum UserType {
    DEFAULT = "default",
    COMPETED = "completed",
}
@Entity("users")
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

    @Column( 'varchar', { default:123435673 } )
        mobile_number: string

    @Column( 'varchar', { length:12 ,default: 'JoJames2345' } )
        user_name:string;

    @Column('varchar', { length:30 , default: 'JohnJames100@email.com' })
        email:string;

    @Column('varchar',{length:50, default:["550e8400-e29c-41d4-a715-446655440000"]})
        accounts:string[];

    @Column( 'varchar', { default: 'Passwordxmx0'} )
        password:string;  
    
    @OneToOne( ()=> Inbox,inbox => inbox.user )
        @JoinColumn()
        inbox: Inbox;
    @CreateDateColumn({ name: 'created_at' })
        createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
        updatedAt: Date;
}