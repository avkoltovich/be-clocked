import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {
  }

  async validateUser({ username, passwordHash }: Prisma.UserCreateInput): Promise<any> {
    const user = await this.usersService.findOne({ username });

    if (user && user.passwordHash === passwordHash) {
      const { passwordHash, ...result } = user;

      return result;
    }

    return null;
  }

  async login(user: Prisma.UserWhereUniqueInput) {
    const payload = { username: user.username, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}
