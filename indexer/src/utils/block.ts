import { ethersProvider } from "../singletons";

export async function getCurrentBlockNumber(): Promise<number> {
	return await ethersProvider.getBlockNumber();
}
