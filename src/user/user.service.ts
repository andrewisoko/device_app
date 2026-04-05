import { Injectable, NotFoundException,UnauthorizedException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm'
import { RegisterDto } from './signUp.signIn/registerDto';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>){    
    }


    findUserById(id:string){
        return this.userRepository.findOneBy({id})
    }
    findUserByEmail(email:string){
        return this.userRepository.findOneBy({email})
    }

    createUser(data:Partial<RegisterDto>){
        const user = this.userRepository.create(data)
        return this.userRepository.save(user)
    }


    deleteUser(id:string){
        return this.userRepository.delete(id)
    }
}

