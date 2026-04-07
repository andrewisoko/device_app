import { Controller,Post,Body,Request } from '@nestjs/common';
import { AccountService } from './account.service';
import { NotFoundException } from '@nestjs/common';
import { Role } from 'src/user/entity/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/jwt/jwt.guard';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';


@Controller('account')
export class AccountController {
     constructor(private accountService:AccountService,
    ){}

    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.USER) 
    @Post('create')
    createAccount(
        @Body() createAccountDto:{ currency:string; initialDeposit:number, username?:string; },
        @Request() req
    ){
        const {username} = req.user
        if(req.user.role === Role.ADMIN){

            if(!createAccountDto.username) throw new NotFoundException("username not found")
            return this.accountService.createAccount(
                createAccountDto.currency,
                createAccountDto.initialDeposit,
                createAccountDto.username,
            )

        };
        return this.accountService.createAccount(
        createAccountDto.currency,
        createAccountDto.initialDeposit,
        username
     )    
    }
}
