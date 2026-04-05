import { IsString, IsNotEmpty,IsNumber, IsOptional} from "class-validator";
import { Role } from "../entity/user.entity";


export class RegisterDto{


    @IsString()
    @IsNotEmpty()
    fullName:string  
    
    
    @IsString()
    @IsNotEmpty()
    email:string  

    @IsString()
    @IsNotEmpty()
    password:string
    
    @IsString()
    @IsNotEmpty()
    confirmPassword:string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    role:Role
    
}