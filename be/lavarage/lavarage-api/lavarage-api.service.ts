import { Injectable } from "@nestjs/common";
import { LoggerService } from "@utils/logger/logger.service";
import axios, { AxiosInstance } from "axios";
import {
  BscOffersQueryParams,
  CloseBscPositionDto,
  DelTpDto,
  EvmPositionsQueryParams,
  OffersMatchQueryParams,
  OffersQueryParams,
  OffersV2QueryParams,
  OpenBscPositionDto,
  OpenPositionDto,
  PartialRepayDto,
  RepayPositionDto,
  SellManualDto,
  SellPositionDto,
  SpiltPositionDto,
  TpDto,
  UserPositionsQueryParams,
} from "@modules/lavarage/common/lavarage.dto";

@Injectable()
export class LavarageApiService {
  private _axios: AxiosInstance;
  private _axiosBsc: AxiosInstance;
  private _axiosBscNoAuth = axios.create({
    baseURL: process.env.LAVARAGE_BSC_URL,
  });
  constructor(private readonly loggerService: LoggerService) {
    this.loggerService.setContext("Lavarage Api - Service");
    this._axios = axios.create({
      baseURL: process.env.LAVARAGE_V2_BASE_URL,
    });
    this._axios.interceptors.request.use((request) => {
      request.headers["x-api-key"] = process.env.LAVARAGE_API_KEY;
      return request;
    });

    this._axiosBsc = axios.create({
      baseURL: process.env.LAVARAGE_BSC_URL,
    });
    this._axiosBsc.interceptors.request.use((request) => {
      request.headers["x-api-key"] = process.env.LAVARAGE_API_KEY;
      return request;
    });
  }

  async openPosition(payload: OpenPositionDto) {
    try {
      this.loggerService.debug(`OpenPosition - ${process.env.LAVARAGE_V2_BASE_URL}/api/sdk/v1.0/positions/open`);
      const { data } = await this._axios.post("/api/sdk/v1.0/positions/open", payload, { headers: { "Content-Type": "application/json" } });
      return data;
    } catch (err) {
      this.loggerService.error("Error while trying to open position", err.response?.data || err);
      console.log("err", err);
      throw err;
    }
  }

  async openBscPosition(payload: OpenBscPositionDto) {
    try {
      this.loggerService.debug(`OpenPosition - ${process.env.LAVARAGE_V2_BASE_URL}/api/sdk/v1.0/positions/bsc/open`);
      const { data } = await this._axiosBsc.post("/api/sdk/v1.0/positions/bsc/open", payload, { headers: { "Content-Type": "application/json" } });
      return data;
    } catch (err) {
      this.loggerService.error("Error while trying to open bsc position", err.response?.data || err);
      console.log("err", err);
      throw err;
    }
  }

  async sellBscPosition(payload: CloseBscPositionDto) {
    try {
      const { data } = await this._axiosBsc.post("/api/sdk/v1.0/positions/bsc/close", payload, { headers: { "Content-Type": "application/json" } });
      return data;
    } catch (err) {
      this.loggerService.error("Error while trying to sell bsc position", err.response?.data || err);
      console.log("err", err);
      throw err;
    }
  }

  async sellPosition(payload: SellPositionDto) {
    try {
      const { data } = await this._axios.post("/api/sdk/v1.0/positions/sell", payload, { headers: { "Content-Type": "application/json" } });
      return data;
    } catch (err) {
      this.loggerService.error("Error while trying to sell position", err.response?.data || err);
      console.log("err", err);
      throw err;
    }
  }

  async sellManual(payload: SellManualDto) {
    try {
      const { data } = await this._axios.post("/api/sdk/v1.0/positions/sell-manual-build", payload, { headers: { "Content-Type": "application/json" } });
      return data;
    } catch (err) {
      this.loggerService.error("Error while trying to sell manual position", err.response?.data || err);
      console.log("err", err);
      throw err;
    }
  }

  async repayPosition(payload: RepayPositionDto) {
    try {
      const { data } = await this._axios.post("/api/sdk/v1.0/positions/repay", payload, { headers: { "Content-Type": "application/json" } });
      return data;
    } catch (err) {
      this.loggerService.error("Error while trying to repay position", err.response?.data || err);
      console.log("err", err);
      throw err;
    }
  }

  async splitPosition(payload: SpiltPositionDto) {
    try {
      const { data } = await this._axios.post("/api/sdk/v1.0/positions/split", payload, { headers: { "Content-Type": "application/json" } });
      return data;
    } catch (err) {
      this.loggerService.error("Error while trying to split position", err.response?.data || err);
      console.log("err", err.response);
      throw err;
    }
  }

  async submitTp(payload: TpDto) {
    try {
      const { data } = await this._axios.post("/api/sdk/v1.0/positions/take-profit", payload, { headers: { "Content-Type": "application/json" } });
      return data;
    } catch (err) {
      this.loggerService.error("Error while trying to submit take profit", err.response?.data || err);
      console.log("err", err.response);
      throw err;
    }
  }

  async updateTp(payload: TpDto) {
    try {
      const { data } = await this._axios.put("/api/sdk/v1.0/positions/take-profit", payload, { headers: { "Content-Type": "application/json" } });
      return data;
    } catch (err) {
      this.loggerService.error("Error while trying to update take profit", err.response?.data || err);
      console.log("err", err.response);
      throw err;
    }
  }

  async deleteTp(payload: DelTpDto) {
    try {
      const { data } = await this._axios.delete("/api/sdk/v1.0/positions/take-profit", { data: payload, headers: { "Content-Type": "application/json" } });
      return data;
    } catch (err) {
      this.loggerService.error("Error while trying to delete take profit", err.response?.data || err);
      console.log("err", err.response);
      throw err;
    }
  }

  async partialRepayPosition(payload: PartialRepayDto) {
    try {
      const { data } = await this._axios.post("/api/sdk/v1.0/positions/partial-repay", payload, { headers: { "Content-Type": "application/json" } });
      return data;
    } catch (err) {
      this.loggerService.error("Error while trying to partial-repay position", err.response?.data || err);
      console.log("err", err);
      throw err;
    }
  }

  async getOffers(query?: OffersQueryParams) {
    try {
      const { data } = await this._axios.get("/api/sdk/v1.0/offers", {
        params: query,
        headers: { "Content-Type": "application/json" },
      });
      return data;
    } catch (err) {
      this.loggerService.error("Error while fetching offers", err.response?.data || err);
      throw err;
    }
  }

  async getOffersV2(query?: OffersV2QueryParams) {
    try {
      const { data } = await this._axios.get("/api/sdk/v1.0/offers/v2", {
        params: query,
        headers: { "Content-Type": "application/json" },
      });
      return data;
    } catch (err) {
      this.loggerService.error("Error while fetching offers v2", err.response?.data || err);
      throw err;
    }
  }

  async getOffersMatch(query?: OffersMatchQueryParams) {
    try {
      const { data } = await this._axios.get("/api/sdk/v1.0/offers/match", {
        params: query,
        headers: { "Content-Type": "application/json" },
      });
      return data;
    } catch (err) {
      this.loggerService.error("Error while fetching offers match", err.response?.data || err);
      throw err;
    }
  }

  async getUserPositions(query: UserPositionsQueryParams) {
    try {
      const { data } = await this._axios.get("/api/sdk/v1.0/positions/maxbid", {
        params: query,
        headers: { "Content-Type": "application/json" },
      });
      return data;
    } catch (err) {
      this.loggerService.error("Error while fetching user positions", err.response?.data || err);
      throw err;
    }
  }

  async getEvmPositions(query?: EvmPositionsQueryParams) {
    try {
      const { data } = await this._axiosBscNoAuth.get(`/api/sdk/v1.0/positions/evm`, {
        params: query,
        headers: {
          "Content-Type": "application/json",
        },
      });
      return data;
    } catch (err) {
      this.loggerService.error("Error while fetching Evm Positions", err.response?.data || err);
      throw err;
    }
  }

  async getBscOffers(query?: BscOffersQueryParams) {
    try {
      const { data } = await this._axiosBsc.get("/api/sdk/v1.0/offers/bsc");
      return data;
    } catch (err) {
      this.loggerService.error("Error while fetching bsc offers", err.response?.data || err);
      throw err;
    }
  }

  async syncPositions(type: "bsc_open" | "bsc_close") {
    try {
      const { data } = await this._axiosBscNoAuth.post(`/api/sdk/v1.0/positions/sync`, {
        params: {
          type,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      return data;
    } catch (err) {
      this.loggerService.error("Error while Syncing Positions", err.response?.data || err);
      throw err;
    }
  }
}
