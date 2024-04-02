import {
  BANANA_ROUTER_ADDRESS,
  MAESTRO_ROUTER_ADDRESS,
  UNISWAP_ROUTER_ADDRESS,
  buyLimit,
} from "@/utils/constants";
import { ethers } from "ethers";
import { log } from "@/utils/handlers";
import { ethPrice } from "@/vars/ethPrice";
import { sendAlert } from "@/bot/sendAlert";
import { TxnData } from "@/types";
import { TransactionExtended } from "@/types/web3";

export async function processTxn(tx: TransactionExtended) {
  const inputData = tx.input;
  const methodId = inputData?.slice(0, 10) as unknown as string;
  let token = "";

  const METHOD_ID_MAP: { [key: string]: string } = {
    "0x7ff36ab5": "swapExactETHForTokens",
    "0xb6f9de95": "swapExactETHForTokensSupportingFeeOnTransferTokens",
  };

  const boughtFor = Number(ethers.utils.formatEther(tx?.value || 0));
  const buy = parseFloat((boughtFor * ethPrice).toFixed(2));

  // Banana
  if (tx.to === BANANA_ROUTER_ADDRESS && methodId === "0x0162e2d0") {
    const params = inputData?.slice(10);
    const fullDataElement = params?.slice(13 * 64, 13 * 64 + 64);
    token = "0x" + fullDataElement?.slice(24, 64);
    log(`Banana ${token} buy of $${buy} - ${tx.hash}`);
  }

  // Uniswap or Maestro
  else if (
    (tx.to === UNISWAP_ROUTER_ADDRESS || tx.to === MAESTRO_ROUTER_ADDRESS) &&
    METHOD_ID_MAP[methodId]
  ) {
    token = "0x" + inputData?.slice(-40);
    if (tx.to === UNISWAP_ROUTER_ADDRESS)
      log(`Uniswap ${token} buy of $${buy} - ${tx.hash}`);
    else if (tx.to === MAESTRO_ROUTER_ADDRESS)
      log(`Maestro ${token} buy of $${buy} - ${tx.hash}`);
  }

  // if (buy < buyLimit) return false

  // ------------------------------ Logging buy ------------------------------
  if (!token) return false;

  const txnData: TxnData = {
    buyUsd: buy,
    buyer: tx.from || "",
    buyEth: boughtFor,
  };

  if (buy > buyLimit) sendAlert(token, txnData);
}
