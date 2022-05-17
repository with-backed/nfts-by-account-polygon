import { ethers } from "ethers";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { jsonRpcERC721Contract } from "./contracts";

export interface NFTEntity {
  id: string;
  identifier: string;
  uri?: string | null;
  approvals: Approval[];
}

interface Approval {
  id: string;
  approved: {
    id: string;
    tokens: NFTEntity[];
  };
}

export async function getNFTsForAccount(owner: string): Promise<NFTEntity[]> {
  console.log(process.env.RPC_URL!);
  const web3 = createAlchemyWeb3(process.env.RPC_URL!);

  const nfts = await web3.alchemy.getNfts({
    owner,
  });

  return await Promise.all(
    nfts.ownedNfts.map(async (nft) => ({
      id: nft.contract.address,
      identifier: nft.id.tokenId,
      approvals: await getApprovalsForNFT(nft.contract.address, nft.id.tokenId),
    }))
  );
}

async function getApprovalsForNFT(
  contractAddress: string,
  tokenId: string
): Promise<Approval[]> {
  const jsonRpcProvider = process.env.RPC_URL!;
  const contract = jsonRpcERC721Contract(contractAddress, jsonRpcProvider);

  try {
    const approvedAddress = await contract.getApproved(
      ethers.BigNumber.from(tokenId)
    );
    return [
      {
        id: contractAddress,
        approved: {
          id: approvedAddress,
          tokens: [],
        },
      },
    ];
  } catch (_e) {
    return [];
  }
}
