import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ValidateUserDto } from './dto/validate-user.dto';
import { User } from 'src/users/user.entity';
import { AccessTokenPayloadDto } from './dto/access-token-payload.dto';
import { RefreshTokenPayloadDto } from './dto/refresh-token-payload.dto';
import { RefreshToken } from './refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @Inject('JwtAccessService')
    private readonly jwtAccessService: JwtService,
    @Inject('JwtRefreshService')
    private readonly jwtRefreshService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async validateUser(validateUserDto: ValidateUserDto): Promise<any> {
    const user = await this.usersService.findUserByEmail({
      email: validateUserDto.email,
    });
    if (user && user.password === validateUserDto.password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(
    user: User,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return {
      access_token: await this.generateAccessToken(user),
      refresh_token: await this.generateRefreshToken(user),
    };
  }

  async generateRefreshToken(user: User): Promise<string> {
    const refreshTokenPayload: RefreshTokenPayloadDto = {
      email: user.email,
      sub: user.id,
    };

    const signedRefreshToken = this.jwtRefreshService.sign(refreshTokenPayload);

    const refreshToken: RefreshToken = {
      userId: user.id,
      token: signedRefreshToken,
      expiresIn: new Date(
        1000 * this.jwtRefreshService.decode(signedRefreshToken)['exp'],
      ),
    };

    await this.refreshTokenRepository.insert(refreshToken);
    return signedRefreshToken;
  }

  async getUserIfRefreshTokenIsValid(
    refreshTokenPayloadDto: RefreshTokenPayloadDto,
    refreshToken: string,
  ): Promise<User> {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, userId: refreshTokenPayloadDto.sub },
    });
    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return await this.usersService.findUserById({ id: token.userId });
  }

  async generateAccessToken(user: User): Promise<string> {
    const accessTokenPayload: AccessTokenPayloadDto = {
      email: user.email,
      sub: user.id,
    };
    return this.jwtAccessService.sign(accessTokenPayload);
  }
}
