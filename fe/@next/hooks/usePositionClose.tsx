import { web3 } from "@coral-xyz/anchor"
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { PublicKey, VersionedTransaction } from "@solana/web3.js"
import { Position } from "@types"
import { useState } from "react"
import { fetchSwapInfo } from "./use-confirmed-sell"
import { ActionType, sendTransaction } from "@utils"
import { useLavarage } from "@providers"
import { useAlertsStore, usePreferencesStore, userProfileStore } from "@store"
import { useShallow } from "zustand/react/shallow"
import { useTranslations } from "next-intl"
import { useQueryClient } from "@tanstack/react-query"
import { usePositions } from "./use-positions"
import { useSelectedWallet } from "./use-selected-wallet"
import { leverageApiService } from "@services"
import { FEE_RECIPIENT, USDC_ADDRESS } from "@config"
import bs58 from "bs58"

export const usePositionClose = () => {
  const txTranslation = useTranslations("sendTransactionComponent")
  const [isConfirmedPosition, setIsConfirmedPosition] = useState(false)
  const queryClient = useQueryClient()
  const lavarages = useLavarage()
  // const { data = [] } = useTokenList()
  const { refreshLongPosition } = usePositions()
  const wallet = useSelectedWallet()

  const slippage = usePreferencesStore((state) => state.slippage)
  const [walletType, selectedWallet] = userProfileStore(useShallow((s) => [s.walletType, s.selectedWallet]))
  const [addAlert, removeAlert, loading, setLoading, setConfirming, confirming] = useAlertsStore(
    useShallow((state) => [
      state.addAlert,
      state.removeAlert,
      state.loading,
      state.setLoading,
      state.setConfirming,
      state.confirming
    ])
  )
  const closePositionHandler = async (position: Position, realPnL: number) => {
    const quoteSymbol = position.quoteToken.symbol as string
    const lavarage = quoteSymbol === "SOL" ? lavarages[0] : lavarages[1]

    try {
      setLoading(true)
      setConfirming(true)
      // let seedAddress = position?.accountMeta?.seed
      // if (!seedAddress) {
      //   const positionData = await leverageApiService.getPositionData(position?.positionAddress)
      //   seedAddress = positionData?.seed
      // }
      // const tokenAddressPubKey = new PublicKey(position?.collateralToken.address)
      // const tokenMintAccount = await lavarage.program.provider.connection.getAccountInfo(tokenAddressPubKey)

      // const positionATA = getAssociatedTokenAddressSync(
      //   new web3.PublicKey(position?.collateralToken.address),
      //   new web3.PublicKey(position.positionAddress),
      //   true,
      //   tokenMintAccount?.owner
      // )
      // const balance = await getAccount(
      //   lavarage.program.provider.connection,
      //   positionATA,
      //   "finalized",
      //   tokenMintAccount?.owner
      // )
      // const tokenData = data?.find((item) => item.address === baseCurrency?.address)
      const actionType: ActionType = "sell"
      // if (!tokenData?.offers) {
      //   console.error("Token offers not available")
      //   return
      // }
      const walletPublicKey = lavarage?.getWalletPublicKey()

      if (!walletPublicKey) {
        console.error("Wallet Address not found")
        return
      }
      // const info = await fetchSwapInfo(lavarage, position, Number(slippage), tokenMintAccount?.owner)
      const preparePayload = {
        positionId: position.positionAddress,
        offerId: position.offerAddress,
        profitFeeMarkup: 0.02,
        partnerFeeRecipient: FEE_RECIPIENT as string,
        partnerFeeMarkupBps: 75,
        quoteToken: position?.quoteToken?.address,
        slippage: +slippage * 100,
        userPubKey: walletPublicKey?.toString(),
        ...(position?.quoteToken.address === USDC_ADDRESS
          ? {}
          : {
              platformFeeBps: 50,
              platformFeeReceiver: lavarage.getReferralATASync(new PublicKey(position?.quoteToken.address))?.toBase58()
            })
      }
      const txData = await leverageApiService.closePosition(preparePayload)
      const txBuffer = bs58.decode(txData?.transaction)
      const tx = VersionedTransaction.deserialize(txBuffer)
      // const tx = await lavarage.sellPosition(
      //   position.offerAddress,
      //   balance.amount.toString(),
      //   new PublicKey(seedAddress),
      //   info,
      //   realPnL
      // )

      if (!tx) return
      if (!wallet) {
        console.log("wallet Address Not Found")
        return
      }
      const res = await sendTransaction(
        walletType,
        selectedWallet,
        tx,
        addAlert,
        removeAlert,
        setConfirming,
        lavarage.program.provider,
        wallet,
        txTranslation,
        undefined,
        actionType,
        queryClient,
        refreshLongPosition
      )
      if (res) {
        setIsConfirmedPosition(true)
        return Promise.resolve(res)
      }
    } catch (error) {
      console.error("Error in selling position:", error)
      return Promise.reject(error)
    } finally {
      setConfirming(false)
      setLoading(false)
    }
  }
  return { closePositionHandler, isLoading: isConfirmedPosition }
}
