import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/user/entity/user.entity';

export function Roles(...roles:Role[]){
    return SetMetadata("ROLES_KEY",roles)
}