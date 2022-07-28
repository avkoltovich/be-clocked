import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import { compare, genSalt, hash } from "bcryptjs";
import { USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from "./auth.constants";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {
  }

  async validateUser({ email, password }: AuthDto): Promise<any> {
    const user = await this.usersService.findOne({ email });

    if (!user) {
      throw new UnauthorizedException(USER_NOT_FOUND_ERROR);
    }

    const isCorrectPassword = await compare(password, user.passwordHash);

    if (!isCorrectPassword) {
      throw new UnauthorizedException(WRONG_PASSWORD_ERROR);
    }

    const { passwordHash, ...result } = user;

    return result;
  }

  async login(user: Prisma.UserWhereUniqueInput) {
    const payload = { email: user.email, sub: user.id };

    return {
      accessToken: this.jwtService.sign(payload),
      email: user.email,
      id: user.id
    };
  }

  async create(data: NewUser): Promise<AuthenticatedUser> {
    const salt = await genSalt(10);

    const newUser: Prisma.UserCreateInput = {
      email: data.email,
      passwordHash: await hash(data.password, salt),
      name: data.name,
      surname: data.surname,
      gender: data.gender,
      dob: data.dob,
      phone: data.phone,
      city: data.city,
      team: data.team
    };

    const createdUser = await this.usersService.create(newUser);

    return {
      id: createdUser.id,
      email: createdUser.email,
      accessToken: this.jwtService.sign(createdUser)
    };
  }
}
