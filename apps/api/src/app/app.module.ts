import { Module } from "@nestjs/common";

import { AppService } from "./app.service";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true })
  ],
  providers: [AppService]
})
export class AppModule {
}
