import { ethers } from "ethers";
import { selectedChain } from "./selected-chain";

export const ethersProvider = new ethers.JsonRpcProvider(selectedChain.rpc);
