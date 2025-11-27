import { Body, Controller, Delete, Get, Post, Put, Query, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { CurrentUser } from "@modules/common/decorator/current-user.decorator";
import { User } from "@modules/user/user.entity";
import { LavarageService } from "./lavarage.service";
import {
  OpenPositionDto,
  SellPositionDto,
  RepayPositionDto,
  PartialRepayDto,
  OffersV2QueryParams,
  OffersQueryParams,
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
import { ResponseCode, ResponseMessage } from "@utils/enum";
import { ApiExcludeController } from "@nestjs/swagger";
import { PrivyAuthGuard } from "@modules/user/privy-auth-guard";

@ApiExcludeController()
@Controller("/api/lavarage")
export class LavarageController {
  constructor(private readonly service: LavarageService) {}

  @UseGuards(PrivyAuthGuard)
  @Post("/open")
  async openPosition(@Res() res: Response, @CurrentUser() user: User, @Body() payload: OpenPositionDto): Promise<Response> {
    const data = await this.service.openPosition(user, payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @UseGuards(PrivyAuthGuard)
  @Post("/bsc/open")
  async openBscPosition(@Res() res: Response, @CurrentUser() user: User, @Body() payload: OpenBscPositionDto): Promise<Response> {
    const data = await this.service.openBscPosition(payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @UseGuards(PrivyAuthGuard)
  @Post("/sell")
  async sellPosition(@Res() res: Response, @CurrentUser() user: User, @Body() payload: SellPositionDto): Promise<Response> {
    const data = await this.service.sellPosition(user, payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @UseGuards(PrivyAuthGuard)
  @Post("/bsc/close")
  async closeBscPosition(@Res() res: Response, @CurrentUser() user: User, @Body() payload: CloseBscPositionDto): Promise<Response> {
    const data = await this.service.closeBscPosition(payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @UseGuards(PrivyAuthGuard)
  @Post("/sell-manual")
  async sellManual(@Res() res: Response, @CurrentUser() user: User, @Body() payload: SellManualDto): Promise<Response> {
    const data = await this.service.sellManual(user, payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @UseGuards(PrivyAuthGuard)
  @Post("/split")
  async splitPosition(@Res() res: Response, @CurrentUser() user: User, @Body() payload: SpiltPositionDto): Promise<Response> {
    const data = await this.service.splitPosition(user, payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @UseGuards(PrivyAuthGuard)
  @Post("/take-profit")
  async submitTp(@Res() res: Response, @CurrentUser() user: User, @Body() payload: TpDto): Promise<Response> {
    const data = await this.service.submitTp(user, payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @UseGuards(PrivyAuthGuard)
  @Put("/take-profit")
  async updateTp(@Res() res: Response, @CurrentUser() user: User, @Body() payload: TpDto): Promise<Response> {
    const data = await this.service.updateTp(user, payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @UseGuards(PrivyAuthGuard)
  @Delete("/take-profit")
  async delTp(@Res() res: Response, @CurrentUser() user: User, @Body() payload: DelTpDto): Promise<Response> {
    const data = await this.service.delTp(user, payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @UseGuards(PrivyAuthGuard)
  @Post("/repay")
  async repayPosition(@Res() res: Response, @CurrentUser() user: User, @Body() payload: RepayPositionDto): Promise<Response> {
    const data = await this.service.repayPosition(user, payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @UseGuards(PrivyAuthGuard)
  @Post("/partial-repay")
  async partialRepayPosition(@Res() res: Response, @CurrentUser() user: User, @Body() payload: PartialRepayDto): Promise<Response> {
    const data = await this.service.partialRepayPosition(user, payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @UseGuards(PrivyAuthGuard)
  @Get("/positions")
  async getUserPositions(@Res() res: Response, @CurrentUser() user: User, @Query() query: UserPositionsQueryParams): Promise<Response> {
    const data = await this.service.getUserPositions(query);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @UseGuards(PrivyAuthGuard)
  @Get("/evm/positions")
  async getEvmPositions(@Res() res: Response, @CurrentUser() user: User, @Query() query: EvmPositionsQueryParams): Promise<Response> {
    const data = await this.service.getEvmPositions(query);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @Get("/bsc/offers")
  async bscOffers(@Res() res: Response, @CurrentUser() user: User, @Query() query: BscOffersQueryParams): Promise<Response> {
    const data = await this.service.getBscOffers(query);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @Get("/offers")
  async getOffers(@Res() res: Response, @Query() query: OffersQueryParams) {
    const data = await this.service.getOffers(query);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @Get("/offers/v2")
  async getOffersV2(@Res() res: Response, @Query() query: OffersV2QueryParams) {
    const data = await this.service.getOffersV2(query);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }

  @Get("/offers/match")
  async getOffersMatch(@Res() res: Response, @Query() query: OffersMatchQueryParams) {
    const data = await this.service.getOffersMatch(query);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    });
  }
}
