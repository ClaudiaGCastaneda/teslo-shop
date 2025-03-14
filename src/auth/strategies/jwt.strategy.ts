import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly configService: ConfigService, // Asegúrate de que esté correctamente inyectado
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    super({
      secretOrKey: jwtSecret, // Obtener el secreto del JWT desde ConfigService
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extraer el token del encabezado Authorization
    });
  }

  // Aquí puedes implementar la validación del JWT
  async validate(payload: any): Promise<User> {

    const { email } = payload;

    const user = await this.userRepository.findOneBy( { email } );
    if (!user) {
      throw new UnauthorizedException('Token not valid');
    }

    if ( !user.isActive ) {
        throw new UnauthorizedException('User is inactive, talk with and admin')
    }


    return user;
  }
}
