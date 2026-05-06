import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { NgosService } from '../../ngos/ngos.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private ngosService: NgosService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'social-impact-secret',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const idNum = Number.parseInt(payload.sub, 10);

    if (payload.role === Role.NGO) {
      const ngo = await this.ngosService.findOptionalById(idNum);
      if (!ngo || ngo.status !== 'active') {
        throw new UnauthorizedException();
      }
      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }

    const user = await this.usersService.findByIdPlain(idNum);
    if (!user?.isActive) {
      throw new UnauthorizedException();
    }

    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
