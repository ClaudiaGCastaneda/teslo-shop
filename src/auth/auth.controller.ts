import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Headers,  SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, CreateUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser, RawHeaders } from './decorators/';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { Auth } from './decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';
import { IncomingHttpHeaders } from 'http';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body()  loginUserDto : LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user:User
  ){

    return this.authService.checkAuthStatus ( user );

  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    //@Req() request: Express.Request
    @GetUser() user:User,
    @GetUser('email') userEmail:string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ){
    //console.log(request)
    console.log({ user })
    return {
      ok:true,
      message: 'Hola Mundo Private',
      user,
      userEmail,
      rawHeaders,
      headers
      
    }
  }

  @Get('private2')
  @RoleProtected( ValidRoles.superUser, ValidRoles.user)
 // @SetMetadata('roles', ['admin', 'super-user'])
  @UseGuards ( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user:User
  ){
    return {
      ok:true,
      user
    };
  }

  @Get('private3')
  //  @Auth( ) Cuando esta vacío solo se valida el token
  @Auth( ValidRoles.admin)
  privateRoute3(
    @GetUser() user:User
  ){
    return {
      ok:true,
      user
    };
  }

}


