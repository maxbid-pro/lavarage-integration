"use client"

import axios from "axios"
import { BaseService } from "./base-service"
import {
  ClosePositionPayload,
  DeleteTakeProfitPayload,
  IPositionData,
  OpenPositionPayload,
  openPositionResponse,
  RepayPositionPayload,
  SellManualPositionPayload,
  SplitPositionPayload,
  SplitPositionResponse,
  TakeProfitPayload,
  TokenOfferResponse,
  TokenOffersType,
  TokenOffersTypeV2
} from "@types"
import { Position } from "@providers"

export class LeverageApi extends BaseService {
  constructor() {
    super()
  }

  async getOffers() {
    try {
      const response = await this.http.get<{ data: TokenOffersType[] }>(`/lavarage/offers`)
      return response.data.data
    } catch (error) {
      throw new Error("Error submitting the request, please try again...")
    }
  }

  async getOffersV2() {
    try {
      const response = await this.http.get<{ data: TokenOffersTypeV2[] }>(`/lavarage/offers/v2`)
      return response.data.data
    } catch (error) {
      throw new Error("Error submitting the request, please try again...")
    }
  }
  async getTokenOffers({ quoteToken, collateralToken }: { quoteToken?: string; collateralToken: string }) {
    try {
      const response = await this.http.get<{ data: TokenOfferResponse }>(`/lavarage/offers/match`, {
        params: {
          quoteToken,
          collateralToken
        }
      })
      return response.data.data
    } catch (error) {
      throw new Error("Error submitting the request, please try again...")
    }
  }
  async openPosition(payload: OpenPositionPayload) {
    try {
      const response = await this.http.post<{ data: openPositionResponse }>(`/lavarage/open`, payload)
      return response.data.data
    } catch (error) {
      throw new Error("Error submitting the request, please try again...")
    }
  }

  async closePosition(payload: ClosePositionPayload) {
    try {
      const response = await this.http.post<{ data: openPositionResponse }>(`/lavarage/sell`, payload)
      return response.data.data
    } catch (error) {
      throw new Error("Error submitting the request, please try again...")
    }
  }

  async sellManualPosition(payload: SellManualPositionPayload) {
    try {
      const response = await this.http.post<{ data: openPositionResponse }>(`/lavarage/sell-manual`, payload)
      return response.data.data
    } catch (error) {
      throw new Error("Error submitting the request, please try again...")
    }
  }

  async repayPosition(payload: RepayPositionPayload) {
    try {
      const response = await this.http.post<{ data: openPositionResponse }>(`/lavarage/repay`, payload)
      return response.data.data
    } catch (error) {
      throw new Error("Error submitting the request, please try again...")
    }
  }

  async partialRepayPosition(payload: RepayPositionPayload) {
    try {
      const response = await this.http.post<{ data: openPositionResponse }>(`/lavarage/partial-repay`, payload)
      return response.data.data
    } catch (error) {
      throw new Error("Error submitting the request, please try again...")
    }
  }

  async splitPosition(payload: SplitPositionPayload) {
    try {
      const response = await this.http.post<{ data: SplitPositionResponse }>(`/lavarage/split`, payload)
      return response.data.data
    } catch (error) {
      throw new Error("Error submitting the request, please try again...")
    }
  }

  async takeProfitPosition(payload: TakeProfitPayload) {
    try {
      const response = await this.http.post<{ data: openPositionResponse }>(`/lavarage/take-profit`, payload)
      return response.data.data
    } catch (error) {
      throw new Error("Error submitting the request, please try again...")
    }
  }

  async updateTakeProfitPosition(payload: TakeProfitPayload) {
    try {
      const response = await this.http.put<{ data: openPositionResponse }>(`/lavarage/take-profit`, payload)
      return response.data.data
    } catch (error) {
      throw new Error("Error submitting the request, please try again...")
    }
  }

  async deleteTakeProfitPosition(payload: DeleteTakeProfitPayload) {
    try {
      const response = await this.http.delete<{ data: openPositionResponse }>(`/lavarage/take-profit`, { data: payload })
      return response.data.data
    } catch (error) {
      throw new Error("Error submitting the request, please try again...")
    }
  }

  async getPositionData(positionAddress: string) {
    try {
      const response = await this.http.get<{ data: IPositionData }>(`/positions/public-key/${positionAddress}`)
      return response.data.data
    } catch (error) {
      throw new Error("Error submitting the request, please try again...")
    }
  }

  async getUserPositions(userPubKey: string, status: string) {
    try {
      const response = await this.http.get<{ data: Position[] }>(
        `/lavarage/positions?userPubKey=${userPubKey}&status=${status}`
      )
      return response.data.data
    } catch (error) {
      console.error("Error getting user positions", error)
      return []
    }
  }
}

export const leverageApiService = new LeverageApi()
