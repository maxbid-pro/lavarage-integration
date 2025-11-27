import { Module } from "@nestjs/common";
import { LavarageApiService } from "./lavarage-api.service";
import { LoggerModule } from "@utils/logger/logger.module";

@Module({
  imports: [LoggerModule],
  providers: [LavarageApiService],
  exports: [LavarageApiService],
})
export class LavarageApiModule {}
