import { applyDecorators, UseGuards } from "@nestjs/common";
import { ValidRoles } from "../interfaces/valid-roles.interface";
import { RoleProtected } from "./role-protected/role-protected.decorator";
import { UserRoleGuard } from "../guards/user-role/user-role.guard";
import { AuthGuard } from "@nestjs/passport";


export function Auth (...roles: ValidRoles[]) {

    return applyDecorators(
        //RoleProtected( ValidRoles.superUser, ValidRoles.admin),
        RoleProtected( ...roles),
        UseGuards ( AuthGuard(), UserRoleGuard)

    )
    
} 