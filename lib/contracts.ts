import { ethers } from "ethers";
import { ERC721, ERC721__factory } from "../types/generated/abis";

export function erc721Contract(
  address: string,
  provider: ethers.providers.Provider | ethers.Signer
) {
  return ERC721__factory.connect(address, provider);
}

export function jsonRpcERC721Contract(
  address: string,
  jsonRpcProvider: string
): ERC721 {
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);
  return erc721Contract(address, provider);
}
