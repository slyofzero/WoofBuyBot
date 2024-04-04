import { AptosTransaction } from "@/types";
import { getTokenAddress } from "@/utils/web3";
import { APTOS_COIN } from "@aptos-labs/ts-sdk";

export async function processTxn(tx: AptosTransaction) {
  const { events, changes } = tx;
  if (!events?.length || !changes?.length) return false;

  eventsLoop: for (const event of events) {
    const isTokenDeposit = event.type.endsWith("::coin::DepositEvent");
    if (!isTokenDeposit) continue;

    const { creation_number } = event.guid;

    for (const change of changes) {
      const changeData = change.data;
      if (!changeData) return false;

      const changeCreationNum =
        changeData.data.deposit_events?.guid.id.creation_num;

      if (changeCreationNum !== creation_number) continue;

      const token = getTokenAddress(changeData.type);
      const amount = Number(event.data.amount);
      const receiver = event.guid.account_address;

      if (token === APTOS_COIN || amount === 0 || !token || !receiver)
        continue eventsLoop;
    }
  }
}
