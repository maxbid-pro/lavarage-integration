import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber, Min, Max, IsPositive, IsOptional, IsBoolean, ValidateNested } from "class-validator";

export class OpenPositionDto {
  @IsString()
  @IsNotEmpty()
  offerId: string;

  @IsNumber()
  @IsPositive()
  marginSOL: number;

  @IsNumber()
  @Min(1)
  @Max(4)
  leverage: number;

  @IsString()
  @IsOptional()
  partnerFeeRecipient: string;

  @IsNumber()
  @IsOptional()
  partnerFeeMarkupBps: number;

  @IsString()
  @IsNotEmpty()
  quoteToken: string;

  @IsNumber()
  @Min(1)
  slippage: number;

  @IsString()
  @IsNotEmpty()
  userPubKey: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  platformFeeBps?: number;

  @IsOptional()
  platformFeeReceiver?: string;
}

export class OpenBscPositionDto {
  @IsString()
  @IsNotEmpty()
  collateralAddress: string;

  @IsString()
  @IsNotEmpty()
  margin: number;

  @IsNumber()
  @Min(1)
  @Max(4)
  leverage: number;

  @IsString()
  @IsNotEmpty()
  partnerFeeRecipient: string;

  @IsString()
  @IsNotEmpty()
  quoteToken: string;

  @IsString()
  @IsNotEmpty()
  userPubKey: string;

  @IsNumber()
  @Min(1)
  slippage: number;
}

export class SellPositionDto {
  @IsString()
  @IsNotEmpty()
  positionId: string;

  @IsString()
  @IsOptional()
  offerId: string;

  @IsString()
  @IsOptional()
  partnerFeeRecipient: string;

  @IsNumber()
  @IsOptional()
  profitFeeMarkup?: number;

  @IsNumber()
  @IsOptional()
  partnerFeeMarkupBps: number;

  @IsString()
  @IsNotEmpty()
  quoteToken: string;

  @IsNumber()
  @Min(1)
  slippage: number;

  @IsString()
  @IsNotEmpty()
  userPubKey: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  platformFeeBps?: number;

  @IsOptional()
  platformFeeReceiver?: string;
}

export class CloseBscPositionDto {
  @IsNumber()
  @IsNotEmpty()
  loanId: number;

  @IsString()
  @IsNotEmpty()
  userPubKey: string;

  @IsString()
  @IsOptional()
  partnerFeeRecipient: string;

  @IsString()
  @IsNotEmpty()
  quoteToken: string;

  @IsNumber()
  @Min(1)
  slippage: number;
}

class AccountDto {
  @IsNumber()
  collateralAmount: number;

  @IsString()
  collateralType: string;

  @IsString()
  seed: string;

  @IsNumber()
  userPaid: number;

  @IsNumber()
  amount: number;
}

class PositionDto {
  @IsString()
  @IsNotEmpty()
  publicKey: string;

  @ValidateNested()
  @Type(() => AccountDto)
  account: AccountDto;
}

export class SellManualDto {
  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;

  @IsString()
  @IsOptional()
  offerId?: string;

  @IsString()
  @IsOptional()
  partnerFeeRecipient?: string;

  @IsNumber()
  @IsOptional()
  profitFeeMarkup?: number;

  @IsNumber()
  @IsOptional()
  partnerFeeMarkupBps?: number;

  @IsString()
  @IsNotEmpty()
  quoteToken: string;

  @IsNumber()
  @IsNotEmpty()
  slippage: number;

  @IsString()
  @IsNotEmpty()
  userPubKey: string;

  @IsString()
  @IsNotEmpty()
  chain: string;

  @IsNumber()
  @IsOptional()
  priorityFeeMicroLamports?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  platformFeeBps?: number;

  @IsOptional()
  @IsString()
  platformFeeReceiver?: string;

  @IsBoolean()
  @IsOptional()
  splitTransaction?: boolean;

  @IsBoolean()
  @IsOptional()
  checkPrice?: boolean;
}

export class SpiltPositionDto {
  @IsString()
  @IsNotEmpty()
  positionId: string;

  @IsNumber()
  @IsPositive()
  splitRatioBps: number;

  @IsString()
  @IsNotEmpty()
  quoteToken: string;

  @IsString()
  @IsNotEmpty()
  userPubKey: string;
}

export class TpDto {
  @IsString()
  @IsNotEmpty()
  positionId: string;

  @IsString()
  @IsOptional()
  partnerFeeRecipient?: string;

  @IsString()
  @IsNotEmpty()
  quoteToken: string;

  @IsNumber()
  @IsNotEmpty()
  targetPrice: number;

  @IsNumber()
  @IsNotEmpty()
  retriggerAt: number;
}

export class DelTpDto {
  @IsString()
  @IsNotEmpty()
  positionId: string;

  @IsString()
  @IsNotEmpty()
  quoteToken: string;
}

export class RepayPositionDto {
  @IsString()
  @IsNotEmpty()
  positionId: string;

  @IsString()
  @IsOptional()
  partnerFeeRecipient?: string;

  @IsNumber()
  @IsOptional()
  profitFeeMarkup?: number;

  @IsNumber()
  @IsOptional()
  partnerFeeMarkupBps: number;

  @IsNumber()
  @IsOptional()
  repaymentBps: number;

  @IsString()
  @IsNotEmpty()
  quoteToken: string;

  @IsString()
  @IsNotEmpty()
  userPubKey: string;
}

export class PartialRepayDto extends RepayPositionDto {}

export class OffersQueryParams {
  includeTokens?: boolean;
  inactiveOffers?: boolean;
}

export class OffersV2QueryParams extends OffersQueryParams {
  includeRawData?: boolean;
}

export class OffersMatchQueryParams {
  @IsOptional()
  quoteToken?: string;

  @IsOptional()
  collateralToken?: string;
}

export class UserPositionsQueryParams {
  @IsString()
  @IsNotEmpty()
  userPubKey: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}

export class EvmPositionsQueryParams {
  @IsOptional()
  @IsString()
  userAddress: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class BscOffersQueryParams {
  @IsOptional()
  @IsBoolean()
  inactiveOffers: boolean;
}
