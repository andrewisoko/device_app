import { Controller,Get,Param,Delete,Request,Post,Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from './entity/user.entity';
import { Roles } from 'src/roles/roles.decorator';
import { JwtAuthGuard } from 'src/jwt/jwt.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { UseGuards } from '@nestjs/common';
import { RegisterDto } from './signUp.signIn/registerDto';
import * as bcrypt from 'bcrypt';
import { SignUpSignInService } from './signUp.signIn/signup.signin.service';
import { LoginDto } from './signUp.signIn/loginDto';

@Controller('user')
export class UserController {
    constructor( 
        private readonly userService:UserService,
        private readonly signUpSingIn:SignUpSignInService,

    ){}

    /**********************/
        /*SignUp/SignIn*/
    /**********************/

    @Post('register')
         async createUser(
            @Body() registerDto:RegisterDto
            ){
                const randomFour = Math.floor(Math.random() * 100000) 
                const userName = registerDto.name.slice(0,3) + registerDto.surname + randomFour.toString
                const hashedpassword = await bcrypt.hash(registerDto.password,10)
                return this.userService.createUser({
                    role:Role.USER,
                    name:registerDto.name,
                    surname:registerDto.surname,
                    userName:userName,
                    email:registerDto.email,
                    password:hashedpassword,
                    confirmPassword:hashedpassword
                })
            }

        @Post('login')
    async login(
    @Body() loginDto:LoginDto
    ){
        const user = await this.signUpSingIn.validateUser(loginDto.email,loginDto.password)
        return this.signUpSingIn.login(user)
    }

    /**********************/
             /*Users*/
    /**********************/


    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.USER) 
    @Get(':id')
        findUser(@Param() id:string):Promise<User|null>{
            return this.userService.findUserById(id)
        }
    
        
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.USER) 
    @Delete(':id')
        deleteUser(
        @Param() idUser:string,
        @Request() req
        ){
            const {id} = req.user
            if(req.user.role === Role.ADMIN){
                return this.userService.deleteUser(idUser) 
                // return "User Successfully deleted"
            };

            if(idUser != id) throw new UnauthorizedException("id not belonging to account")
                // return "User Successfully deleted"
            return this.userService.deleteUser(idUser) 
    }
}
