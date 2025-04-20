import { ethers } from "ethers";
import { selectedChain } from "../config/chains";

export const ethersProvider = new ethers.JsonRpcProvider(selectedChain.rpc);
