import { Keypair, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js"
import BigNumber from "bignumber.js"
import { useCallback } from "react"
import { useShallow } from "zustand/react/shallow"
import { IPriceResponse, TokenInfo } from "@types"
import { useLavarage, useTokenOverview } from "@providers"
import { LavarageService, LavarageV2Service, leverageApiService } from "@services"
import { sendTransaction } from "@utils"
import { useAlertsStore, userProfileStore } from "@store"
import { useTranslations } from "next-intl"
import { notification } from "antd"
import { FEE_RECIPIENT, SOL_ADDRESS, USDC_ADDRESS } from "@config"
import bs58 from "bs58"
import { useSelectedWallet } from "./use-selected-wallet"
import { Account } from "@solana/spl-token"
import { web3 } from "@coral-xyz/anchor"

type UseBorrowProps = {
  solAmount: number
  baseTokenAmount: number | null
  toUSDC: IPriceResponse["data"] | null
  baseToken: TokenInfo
  quoteToken: TokenInfo
  total: number
  slippage: number
  leverage: number
  setAmountFromIx: (arg0: number) => void
  jupiterPlatformFeeBps: number
  onSuccess?: () => void
  onPriceChangeWarning?: (args: { displayedPrice: number; quotedPrice: number; diffPct: number; source?: string }) => void
}

export const useBorrow = ({
  solAmount,
  baseTokenAmount,
  toUSDC,
  slippage,
  total,
  baseToken,
  quoteToken,
  leverage,
  setAmountFromIx,
  jupiterPlatformFeeBps,
  onSuccess,
  onPriceChangeWarning
}: UseBorrowProps) => {
  const lavarages = useLavarage()
  const { tokenOffers, tokenOverview } = useTokenOverview()
  const t = useTranslations("sendTransactionComponent")
  const lavarage = quoteToken?.symbol === "SOL" ? (lavarages[0] as LavarageService) : (lavarages[1] as LavarageV2Service)
  const [addAlert, removeAlert, setLoading, setConfirming] = useAlertsStore(
    useShallow((state) => [state.addAlert, state.removeAlert, state.setLoading, state.setConfirming])
  )

  const [isAuthenticated, walletType, selectedWallet] = userProfileStore(
    useShallow((s) => [s.isAuthenticated, s.walletType, s.selectedWallet])
  )

  // const { data = [] } = useTokenList()
  const wallet = useSelectedWallet()
  const borrow = useCallback(async () => {
    const walletPublicKey = lavarage?.getWalletPublicKey()
    if (!walletPublicKey) {
      console.error("Provider public key is not available.")
      return
    }
    if (!baseTokenAmount) {
      console.error("Base token amount is not available.")
      return
    }
    if (!wallet) {
      console.error("Wallet public key is not available.")
      return
    }
    if (!quoteToken) {
      console.error("Quote token is not available.")
      return
    }

    try {
      setLoading(true)
      setConfirming(true)
      if (!tokenOffers) {
        throw new Error("Offers not found")
      }
      const mintAccount = await lavarage.program.provider.connection.getAccountInfo(new PublicKey(quoteToken.address))
      const tokenProgram = mintAccount?.owner
      const { publicKey: poolKey, apr, nodeWallet } = tokenOffers[0]
      let referralATA:
        | { account: null; instruction: null }
        | { account: Account; instruction: null }
        | { account: { address: web3.PublicKey }; instruction: web3.TransactionInstruction } = {
        account: null,
        instruction: null
      }
      if (tokenProgram?.toBase58() !== "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") {
        referralATA = await lavarage.getReferralTokenAccountOrCreateIfNotExists(new PublicKey(baseToken.address))
      }
      // if (!baseToken?.offers) {
      //   console.error("Token offers not available")
      //   return
      // }
      if (!poolKey) {
        throw new Error("Pool not found")
      }
      const decimals = quoteToken?.decimals ?? 9
      const solAmountBN = new BigNumber(solAmount)
      const multiplier = new BigNumber(10).pow(decimals)
      const marginSOL = solAmountBN.multipliedBy(multiplier).toNumber()
      const preparePayload = {
        offerId: poolKey,
        marginSOL,
        leverage,
        partnerFeeRecipient: FEE_RECIPIENT as string,
        partnerFeeMarkupBps: 75,
        quoteToken: quoteToken.address,
        slippage: slippage * 100,
        userPubKey: walletPublicKey.toString(),
        ...(quoteToken.address === USDC_ADDRESS
          ? {}
          : {
              platformFeeBps: 50,
              platformFeeReceiver: lavarage.getReferralATASync(new PublicKey(quoteToken.address))?.toBase58()
            })
        // platformFeeBps: 50,
        // platformFeeReceiver: lavarage.getReferralATASync(new PublicKey(baseToken.address))?.toBase58()
      }
      const res = await leverageApiService.openPosition(preparePayload)

      // Compute displayed vs quoted price and emit a non-blocking warning if needed
      try {
        const displayedPrice = (() => {
          if (!tokenOverview) return null
          // If quote token is SOL, use priceQuote; if USDC, use priceUsd; otherwise fallback to priceUsd
          if (quoteToken.address === SOL_ADDRESS) return parseFloat(tokenOverview.priceQuote)
          if (quoteToken.address === USDC_ADDRESS) return parseFloat(tokenOverview.priceUsd)
          // Fallback: try priceQuote if available
          return tokenOverview.priceQuote ? parseFloat(tokenOverview.priceQuote) : parseFloat(tokenOverview.priceUsd)
        })()

        let quotedPrice: number | null = null
        const qr: any = (res as any).quoteResponse
        const source: string | undefined = (res as any).quoteSource
        if (qr && qr.inAmount && qr.outAmount) {
          const inAmt = Number(qr.inAmount)
          const outAmt = Number(qr.outAmount)
          const qDec = quoteToken.decimals ?? 9
          const bDec = baseToken.decimals ?? 9
          const inNorm = inAmt / 10 ** qDec
          const outNorm = outAmt / 10 ** bDec
          if (outNorm > 0) {
            quotedPrice = inNorm / outNorm
          }
        }

        if (
          displayedPrice !== null &&
          displayedPrice !== undefined &&
          isFinite(displayedPrice as number) &&
          quotedPrice !== null &&
          isFinite(quotedPrice as number)
        ) {
          const diffPct = Math.abs(((quotedPrice as number) - (displayedPrice as number)) / (displayedPrice as number)) * 100
          if (diffPct > 0.1 && typeof (onPriceChangeWarning as any) === "function") {
            ;(onPriceChangeWarning as any)({
              displayedPrice: displayedPrice as number,
              quotedPrice: quotedPrice as number,
              diffPct,
              source
            })
          }
        }
      } catch (e) {
        // If price computation fails, continue without warning
      }

      const txBuffer = bs58.decode(res?.transaction)
      let tx = VersionedTransaction.deserialize(txBuffer)
      if (referralATA.instruction) {
        const { blockhash } = await lavarage.program.provider.connection.getLatestBlockhash()

        // Resolve the LUT accounts used by the original transaction so we can reconstruct instructions
        const lutPubkeys = tx.message.addressTableLookups.map((l) => l.accountKey)
        const lutInfos = await lavarage.program.provider.connection.getMultipleAccountsInfo(lutPubkeys)
        const lutAccounts = lutInfos
          .map((info, i) => {
            if (!info) return null
            return new web3.AddressLookupTableAccount({
              key: lutPubkeys[i],
              state: web3.AddressLookupTableAccount.deserialize(info.data)
            })
          })
          .filter(Boolean) as web3.AddressLookupTableAccount[]

        // Build the full key list in the same order Solana uses for v0 messages:
        // [staticKeys, ...each LUT.writable, ...each LUT.readonly]
        const staticKeys = tx.message.staticAccountKeys
        const writableFromLookups: web3.PublicKey[] = []
        const readonlyFromLookups: web3.PublicKey[] = []
        tx.message.addressTableLookups.forEach((lookup, i) => {
          const acc = lutAccounts[i]
          if (!acc) return
          writableFromLookups.push(...lookup.writableIndexes.map((idx) => acc.state.addresses[idx]))
          readonlyFromLookups.push(...lookup.readonlyIndexes.map((idx) => acc.state.addresses[idx]))
        })
        const allKeys: web3.PublicKey[] = [...staticKeys, ...writableFromLookups, ...readonlyFromLookups]

        // Reconstruct original instructions as TransactionInstruction[]
        const originalIxs: TransactionInstruction[] = tx.message.compiledInstructions.map((ix) => {
          return new web3.TransactionInstruction({
            programId: allKeys[ix.programIdIndex],
            keys: ix.accountKeyIndexes.map((accountIndex) => ({
              pubkey: allKeys[accountIndex],
              isSigner: tx.message.isAccountSigner(accountIndex),
              isWritable: tx.message.isAccountWritable(accountIndex)
            })),
            data: Buffer.from(ix.data)
          })
        })

        // Prepend the referral instruction and recompile into a new v0 message with the same LUTs
        const messageV0 = new TransactionMessage({
          payerKey: walletPublicKey,
          recentBlockhash: blockhash,
          instructions: [referralATA.instruction, ...originalIxs]
        }).compileToV0Message(lutAccounts)

        tx = new VersionedTransaction(messageV0)
      }
      // const poolPubKey = new PublicKey(poolKey)
      // const keypair = Keypair.generate()

      // const positionAccountPDA = getPda(
      //   [Buffer.from("position"), walletPublicKey?.toBuffer(), poolPubKey.toBuffer(), keypair.publicKey.toBuffer()],
      //   lavarage.program.programId.toBase58()
      // )

      // const tokenAddressPubKey = new PublicKey(baseToken?.address)
      // const tokenMintAccount = await lavarage.program.provider.connection.getAccountInfo(tokenAddressPubKey)

      // const toTokenAccount = await lavarage.getTokenAccountOrCreateIfNotExists(
      //   positionAccountPDA,
      //   tokenAddressPubKey,
      //   tokenMintAccount?.owner
      // )

      // if (!toTokenAccount.account) {
      //   throw new Error("To token account not found")
      // }

      // if (tokenMintAccount?.owner.toBase58() === "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") {
      //   jupiterPlatformFeeBps = 0
      // } else if (quoteToken.address === USDC_ADDRESS) {
      //   jupiterPlatformFeeBps = 0
      // }

      // const instructionsJup = await jupiterSource.getSwapIx(
      //   quoteToken.address,
      //   baseToken?.address,
      //   BigNumber(leverage * solAmount).times(10 ** quoteToken?.decimals),
      //   slippage,
      //   walletPublicKey?.toBase58(),
      //   jupiterPlatformFeeBps,
      //   toTokenAccount.account.address.toBase58(),
      //   true,
      //   false
      //   // tokenMintAccount?.owner.toBase58() === "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
      // )
      // const outAmountFromIx = Number(instructionsJup.quoteResponse.outAmount) / 10 ** baseToken?.decimals
      // setAmountFromIx(outAmountFromIx)

      // const nameOfWallet = wallet?.walletClientType ?? "Unknown"
      // const tx = await lavarage.openBorrowingPosition(
      //   // Note: we can't use the baseTokenAmount and the price in this formula because it is not fixed yet. We will only know the actual result after the tix is executed. Use this in the meantime
      //   leverage * solAmount * (1 - jupiterPlatformFeeBps / 10_000),
      //   baseToken?.address,
      //   solAmount,
      //   instructionsJup,
      //   keypair,
      //   poolKey,
      //   nodeWallet,
      //   apr,
      //   quoteToken.address
      // )

      // const txDetailsForSentry = {
      //   type: "Trade",
      //   walletAddress: wallet?.address,
      //   walletAdapter: nameOfWallet,
      //   tokenSymbol: baseToken?.symbol,
      //   tokenAddress: baseToken?.address,
      //   amount: solAmount,
      //   leverage,
      //   marginAmount: (1 - leverage) * solAmount,
      //   total,
      //   slippage
      // }
      /**
       * MAX_SPEED WALLET TRANSACTION
       */
      // if (walletType === WalletType.MAX_SPEED) {
      //   const latestBlockHash = await lavarage.program.provider.connection.getLatestBlockhash()
      //   const tx2 = VersionedTransaction.deserialize(tx.serialize())
      //   tx2.message.recentBlockhash = latestBlockHash.blockhash
      //   const transactionSimulation = await lavarage.program.provider.connection.simulateTransaction(tx, {
      //     replaceRecentBlockhash: true
      //   })
      //   const transactionLogs = transactionSimulation.value.logs
      //   if (transactionLogs === null || transactionLogs.length === 0) {
      //     throw new Error(t("transactionSimulationError"))
      //   }

      //   for (const log of transactionLogs) {
      //     if (log.includes("failed") || log.includes("panicked") || log.includes("error")) {
      //       throw new Error(parseJSONString(JSON.stringify(log)))
      //     }
      //   }
      //   const transactionBase64 = Buffer.from(tx2.serialize()).toString("base64")
      //   const payload = {
      //     from: selectedWallet?.address as string,
      //     transaction: transactionBase64
      //   }
      //   try {
      //     const response = await tokenService.signTransaction(payload)
      //     addAlert({
      //       type: "maxSpeedSuccess",
      //       tx: response,
      //       message: t("transactionConfirmed"),
      //       description: ""
      //     })
      //     onSuccess?.()
      //   } catch (error: any) {
      //     notification.error({
      //       className: "confirm-notification",
      //       placement: "bottomRight",
      //       duration: 3,
      //       message: <div className="text-white"> {error?.response?.data?.message ?? "Failed To withdraw"}</div>
      //     })
      //   } finally {
      //     setAmountFromIx(0)
      //   }
      //   return
      // }
      const result = await sendTransaction(
        walletType,
        selectedWallet,
        tx,
        addAlert,
        removeAlert,
        setConfirming,
        lavarage.program.provider,
        wallet,
        t,
        undefined,
        "buy",
        undefined,
        onSuccess
      )
      if (result) {
        setConfirming(false)
      }
    } catch (error) {
      if (error instanceof Error && error.message === "User rejected the request.") {
        return
      } else {
      }
      console.error("Error during borrowing:", error)
      notification.error({
        className: "confirm-notification",
        placement: "bottomRight",
        duration: 3,
        message: <div className="text-white"> {"Transaction failed, please try again"}</div>
      })
    } finally {
      setConfirming(false)
      setLoading(false)
      setAmountFromIx(0)
    }
  }, [
    lavarage,
    baseTokenAmount,
    toUSDC,
    baseToken?.address,
    solAmount,
    slippage,
    addAlert,
    setLoading,
    setConfirming,
    removeAlert,
    wallet
  ])

  return { borrow }
}
