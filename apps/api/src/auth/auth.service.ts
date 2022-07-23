import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import { compare, genSalt, hash } from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {
  }

  async validateUser({ username, password }: CreateUserDto): Promise<any> {
    const user = await this.usersService.findOne({ username });

    const isCorrectPassword = compare(password, user.passwordHash);

    if (user && isCorrectPassword) {
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

  async create(data: CreateUserDto) {
    const salt = await genSalt(10);

    const newUser: Prisma.UserCreateInput = {
      username: data.username,
      passwordHash: await hash(data.password, salt)
    };

    return this.usersService.create(newUser);
  }
}
