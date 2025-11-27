import axios, { type AxiosInstance } from "axios"
import { API_HOST } from "@config"
import Cookies from "js-cookie"
import { authEventService, AuthEventType } from "./auth-event-service"
import jwt from "jsonwebtoken"
import { TokenData } from "@providers"

export class BaseService {
  protected http: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: any) => void
    config: any
  }> = []

  constructor(httpClient: AxiosInstance = axios.create({ baseURL: API_HOST })) {
    this.http = httpClient
    this.setupAuthInterceptor()
    this.setupResponseInterceptor()
  }

  private setupAuthInterceptor() {
    this.http.interceptors.request.use((config) => {
      const token = Cookies.get("authToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  private setupResponseInterceptor() {
    this.http.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // If the error is 401 and we haven't already tried to refresh the token
        if (error.response?.status === 401 && !originalRequest._retry) {
          const token = Cookies.get("authToken")
          if (!token || this.isTokenExpired(token)) {
            authEventService.emit(AuthEventType.UNAUTHORIZED)
            return Promise.reject(error)
          }

          // Mark this request as retried to prevent infinite loops
          // originalRequest._retry = true

          // // If we're already refreshing, queue this request
          // if (this.isRefreshing) {
          //   return new Promise((resolve, reject) => {
          //     this.failedQueue.push({ resolve, reject, config: originalRequest })
          //   })
          // }

          // this.isRefreshing = true

          // try {
          //   // Get new token using refresh token
          //   const newToken = await getAccessToken()
          //   if (newToken) {
          //     const decodedToken = jwt.decode(newToken) as TokenData
          //     if (decodedToken?.exp) {
          //       const expiryDate = new Date(decodedToken.exp * 1000)
          //       Cookies.set("authToken", newToken, { expires: expiryDate })
          //     } else {
          //       Cookies.set("authToken", newToken)
          //     }
          //     // Update authorization header
          //     this.http.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
          //     originalRequest.headers["Authorization"] = `Bearer ${newToken}`
          //     // Process the queue of failed requests
          //     this.processQueue(null, newToken)

          //     // Retry the original request
          //     return this.http(originalRequest)
          //   }
          // } catch (refreshError: any) {
          //   // If refresh token request fails, reject all queued requests
          //   this.processQueue(refreshError, null)
          //   authEventService.emit(AuthEventType.UNAUTHORIZED)
          //   return Promise.reject(refreshError)
          // } finally {
          //   this.isRefreshing = false
          // }
        }

        return Promise.reject(error)
      }
    )
  }

  // private processQueue(error: AxiosError | null, token: string | null) {
  //   this.failedQueue.forEach(({ resolve, reject, config }) => {
  //     if (error) {
  //       reject(error)
  //     } else {
  //       if (token) {
  //         config.headers["Authorization"] = `Bearer ${token}`
  //       }
  //       resolve(this.http(config))
  //     }
  //   })

  //   // Clear the queue
  //   this.failedQueue = []
  // }

  private isTokenExpired(token: string): boolean {
    try {
      const decodedToken = jwt.decode(token) as TokenData
      const currentTime = Math.floor(Date.now() / 1000)
      return !decodedToken?.exp || decodedToken.exp <= currentTime
    } catch (e) {
      return true
    }
  }
}
