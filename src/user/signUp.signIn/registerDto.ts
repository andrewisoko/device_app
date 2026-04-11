import { IsString, IsNotEmpty,IsNumber, IsOptional} from "class-validator";
import { Role, UserType } from "../entity/user.entity";


export class RegisterDto{


    @IsString()
    @IsNotEmpty()
    name:string;

    @IsString()
    @IsNotEmpty()
    surname:string; 

    @IsString()
    @IsNotEmpty()
    userName:string; 

    @IsString()
    @IsNotEmpty()
    userType:UserType; 
    
    @IsNumber()
    // @IsNotEmpty()
    mobileNumber: number;


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