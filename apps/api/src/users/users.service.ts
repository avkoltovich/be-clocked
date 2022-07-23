import { Injectable } from "@nestjs/common";
import { PrismaService } from "../repository/prisma/prisma.service";
import { Prisma, User } from "@prisma/client";


@Injectable()
export class UsersService {

  constructor(private prismaService: PrismaService) {
  }

  async findOne(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput
  ): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: userWhereUniqueInput
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prismaService.user.create({
      data
    });
  }
}
