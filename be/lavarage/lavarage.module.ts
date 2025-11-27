import { Module } from "@nestjs/common";
import { LoggerModule } from "@utils/logger/logger.module";
import { LavarageController } from "./lavarage.controller";
import { LavarageService } from "./lavarage.service";
import { LavarageApiModule } from "@utils/lavarage-api/lavarage-api.module";
import { PositionModule } from "@modules/position/position.module";

@Module({
  imports: [LoggerModule,LavarageApiModule,PositionModule],
  providers: [LavarageService],
  exports: [LavarageService],
  controllers: [LavarageController],
})
export class LavarageModule {}
