import { Injectable,Logger,NotFoundException,UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository} from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';




@Injectable()
export class SignUpSignInService {
    constructor( private readonly userService:UserService,
        private readonly jwtService:JwtService,
        private readonly configService:ConfigService,
        @InjectRepository(User) private userRepository:Repository<User>,
    ){}

    
    async validateUser(email:string,password:string){
        const user = await this.userService.findUserByEmail(email)
        if (!user) throw new UnauthorizedException('Invalid credentials')

        const isValidPassword = await bcrypt.compare(password,user.password)
        if (!isValidPassword) throw new UnauthorizedException('Incorrect password')
        
        return user

    }


    async login(user: User) {

         const payload = { 
             sub : user.id,
             name: user.fullName,
            username:user.userName,
            email: user.email,
            // role: user.role,
        }
        
        const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });  
        const refreshToken = this.jwtService.sign(payload, { 
            secret: this.configService.get('JWT_REFRESH_SECRET'), 
            expiresIn: '7d' 
        });
        
        // user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        // user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        // await this.userRepository.save(user);
        
        return { access_token: accessToken, refresh_token: refreshToken };
        };


    // async refresh(refreshToken: string) {
    //     const decoded = this.jwtService.verify(refreshToken, { 
    //         secret: this.configService.get('JWT_REFRESH_SECRET') 
    //     });
        
    //     const user = await this.userRepository.findOne({ 
    //         where: { id: decoded.sub } 
    //     });
        
    //     if (!user || !await bcrypt.compare(refreshToken, user.refreshTokenHash!)) {
    //         throw new UnauthorizedException('Invalid refresh token');
    //     }
        
    //     return this.login(user);  
    //     };


    async resetPassword(email:string,password:string){ 

        const user = await this.userService.findUserByEmail(email)
        if (!user) throw new UnauthorizedException('Email Invalid')
        
        Object.assign(user,{ password: password })
        return this.userRepository.save(user) 

    }
}

