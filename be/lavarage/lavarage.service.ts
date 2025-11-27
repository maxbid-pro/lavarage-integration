import { Injectable } from "@nestjs/common";
import { LavarageApiService } from "./lavarage-api/lavarage-api.service";
import { LoggerService } from "@utils/logger/logger.service";
import {
  OpenPositionDto,
  SellPositionDto,
  RepayPositionDto,
  PartialRepayDto,
  OffersQueryParams,
  OffersV2QueryParams,
  OffersMatchQueryParams,
  SpiltPositionDto,
  UserPositionsQueryParams,
  TpDto,
  DelTpDto,
  SellManualDto,
  OpenBscPositionDto,
  CloseBscPositionDto,
  EvmPositionsQueryParams,
  BscOffersQueryParams,
} from "./common/lavarage.dto";
import { User } from "@modules/user/user.entity";
import { PositionService } from "@modules/position/position.service";
import { throwException } from "@utils/helper";

@Injectable()
export class LavarageService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly lavarageApiService: LavarageApiService,
    private readonly positionService: PositionService,
  ) {}

  async openPosition(user: User, payload: OpenPositionDto) {
    this.loggerService.log(`User ${payload.userPubKey} is opening a position.`);
    return this.lavarageApiService.openPosition(payload);
  }

  async sellPosition(user: User, payload: SellPositionDto) {
    if (!payload?.offerId) {
      const position = await this.positionService.getPositionByPublicKey(payload.positionId);
      if (!position) {
        throwException("POSITION_DOES_NOT_EXISTS");
      }
      payload.offerId = position?.offerId || position?.pool?.publicKey;
    }

    this.loggerService.log(`User ${payload.userPubKey} is selling a position ${payload.positionId} with offer id ${payload.offerId}.`);
    return this.lavarageApiService.sellPosition(payload);
  }

  async repayPosition(user: User, payload: RepayPositionDto) {
    this.loggerService.log(`User ${payload.userPubKey} is repaying a position.`);
    return this.lavarageApiService.repayPosition(payload);
  }

  async splitPosition(user: User, payload: SpiltPositionDto) {
    this.loggerService.log(`User ${payload.userPubKey} is spliting a position.`);
    return this.lavarageApiService.splitPosition(payload);
  }

  async submitTp(user: User, payload: TpDto) {
    return this.lavarageApiService.submitTp(payload);
  }

  async updateTp(user: User, payload: TpDto) {
    return this.lavarageApiService.updateTp(payload);
  }

  async delTp(user: User, payload: DelTpDto) {
    return this.lavarageApiService.deleteTp(payload);
  }

  async partialRepayPosition(user: User, payload: PartialRepayDto) {
    this.loggerService.log(`User ${payload.userPubKey} is partially repaying a position.`);
    return this.lavarageApiService.partialRepayPosition(payload);
  }

  async sellManual(user: User, payload: SellManualDto) {
    this.loggerService.log(`User ${payload.userPubKey} is sell manual  position.`);
    return this.lavarageApiService.sellManual(payload);
  }

  async getOffers(query?: OffersQueryParams) {
    return this.lavarageApiService.getOffers(query);
  }

  async getOffersV2(query?: OffersV2QueryParams) {
    return this.lavarageApiService.getOffersV2(query);
  }

  async getOffersMatch(query?: OffersMatchQueryParams) {
    return this.lavarageApiService.getOffersMatch(query);
  }

  async getUserPositions(query: UserPositionsQueryParams) {
    return this.lavarageApiService.getUserPositions(query);
  }

  async getEvmPositions(query: EvmPositionsQueryParams) {
    return this.lavarageApiService.getEvmPositions(query);
  }

  async openBscPosition(payload: OpenBscPositionDto) {
    return this.lavarageApiService.openBscPosition(payload);
  }

  async closeBscPosition(payload: CloseBscPositionDto) {
    return this.lavarageApiService.sellBscPosition(payload);
  }

  async getBscOffers(query: BscOffersQueryParams) {
    return this.lavarageApiService.getBscOffers(query);
  }

}
