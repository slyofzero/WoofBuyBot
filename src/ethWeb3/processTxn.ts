import {
  BANANA_ROUTER_ADDRESS,
  MAESTRO_ROUTER_ADDRESS,
  TOKEN_ABI,
  UNISWAP_ROUTER_ADDRESS,
  buyLimit,
} from "@/utils/constants";
import { ethers } from "ethers";
import { log } from "@/utils/handlers";
import { ethPrice } from "@/vars/ethPrice";
import { sendAlert } from "@/bot/sendAlert";
import { TokenData, TxnData } from "@/types";
import { TransactionExtended } from "@/types/web3";
import { provider, web3 } from "./config";
import { apiFetcher } from "@/utils/api";

export async function processTxn(tx: TransactionExtended) {
  const inputData = tx.input;
  const methodId = inputData?.slice(0, 10) as unknown as string;
  let token = "";

  const METHOD_ID_MAP: { [key: string]: string } = {
    "0x7ff36ab5": "swapExactETHForTokens",
    "0xb6f9de95": "swapExactETHForTokensSupportingFeeOnTransferTokens",
    "0x38ed1739": "swapExactTokensForTokens",
  };

  const boughtFor = Number(ethers.utils.formatEther(tx?.value || 0));
  let buy = parseFloat((boughtFor * ethPrice).toFixed(2));
  const sentTo = tx.to;

  if (!sentTo) return false;

  // Banana
  if (sentTo === BANANA_ROUTER_ADDRESS && methodId === "0x0162e2d0") {
    const params = inputData?.slice(10);
    const fullDataElement = params?.slice(13 * 64, 13 * 64 + 64);
    token = "0x" + fullDataElement?.slice(24, 64);
    log(`Banana ${token} buy of $${buy} - ${tx.hash}`);
  }

  // Uniswap or Maestro
  else if (
    (sentTo === UNISWAP_ROUTER_ADDRESS || sentTo === MAESTRO_ROUTER_ADDRESS) &&
    METHOD_ID_MAP[methodId]
  ) {
    token = "0x" + inputData?.slice(-40);

    if (methodId === "0x38ed1739") {
      const amountOutHex = `0x${tx.data?.slice(74, 138)}`;
      const amountOut = Number(web3?.utils.hexToNumber(amountOutHex));
      const tokenData = (
        await apiFetcher<TokenData>(
          `https://api.dexscreener.com/latest/dex/tokens/${token}`
        )
      ).data;
      const firstPair = tokenData?.pairs.at(0);
      const price = parseFloat(firstPair?.priceUsd || "0");

      const contractInstance = new ethers.Contract(token, TOKEN_ABI, provider);
      const decimals = Number(await contractInstance.decimals());

      const amountBought = amountOut / 10 ** decimals;
      buy = parseFloat((price * amountBought).toFixed(2));
    }

    if (sentTo === UNISWAP_ROUTER_ADDRESS)
      log(`Uniswap ${token} buy of $${buy} - ${tx.hash}`);
    else if (sentTo === MAESTRO_ROUTER_ADDRESS)
      log(`Maestro ${token} buy of $${buy} - ${tx.hash}`);
  }

  if (buy < buyLimit) return false;

  // ------------------------------ Logging buy ------------------------------
  if (!token) return false;

  const txnData: TxnData = {
    buyUsd: buy,
    buyer: tx.from || "",
    buyEth: boughtFor,
    hash: tx.hash,
  };

  if (buy > buyLimit) sendAlert(token, txnData);
}
