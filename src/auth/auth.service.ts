import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ){

  }

  async create(createUserDto: CreateUserDto) {  

    try {

      const {password,  ...userData} = createUserDto;


     //antes de encriptar contraseña
     //  const user = this.userRepository.create( createUserDto );

     const user = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync( password, 10)
     });
      await this.userRepository.save( user );
      const { password: _, ...userWithoutPassword } = user;

      //return userWithoutPassword;

      //TODO: Retornar el JWT de acceso

      return {
        ...user,
        token: this.getJwtToken ( { id: user.id})
       // token: this.getJwtToken ( { email: user.email})
      }

      
    } catch (error) {
      console.log(error);
      this.handleDBErrors(error);
      
      
    }
    
  }


  async login( loginUserDto: LoginUserDto) {

    const {password, email} = loginUserDto;

    //const user =  await this.userRepository.findOneBy({ email});
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email:true, password:true, id:true}
    })

    if ( !user ) throw new UnauthorizedException('Credentials are not valid (email)');

    if ( !bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid (password)')


    //return user;

    return {
      ...user,
      //token: this.getJwtToken ( { email: user.email})
      token: this.getJwtToken ( { id: user.id})
    }


  }

  private handleDBErrors (error: any) {
    if ( error.code === '23505' )
      throw new BadRequestException('Please check server logs');
  }


  checkAuthStatus (user: User ){
    return {
      ...user,
      token: this.getJwtToken ( { id: user.id})
    }
  }


  private getJwtToken ( payload: JwtPayload ){

    const token = this.jwtService.sign( payload );

    return token;

  }

}



