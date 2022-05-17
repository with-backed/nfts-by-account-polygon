import { ethers } from "ethers";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { jsonRpcERC721Contract } from "./contracts";

export interface NFTEntity {
  id: string;
  identifier: string;
  registry: {
    name: string;
  };
  uri?: string | null;
  approvals?: Approval[] | null;
}

interface Approval {
  id: string;
  approved: {
    id: string;
    tokens: NFTEntity[];
  };
}

export async function getNFTsForAccount(owner: string): Promise<NFTEntity[]> {
  const web3 = createAlchemyWeb3(process.env.RPC_URL!);

  const nfts = await web3.alchemy.getNfts({
    owner,
  });

  return (
    await Promise.all(
      nfts.ownedNfts.map(async (nft) => ({
        id: `${nft.contract.address}-${nft.id.tokenId}`,
        identifier: ethers.BigNumber.from(nft.id.tokenId).toString(),
        registry: {
          name: nft.metadata?.name,
        },
        uri: nft.tokenUri?.raw,
        approvals: await getApprovalsForNFT(
          nft.contract.address,
          nft.id.tokenId
        ),
      }))
    )
  ).filter((nft) => !!nft.approvals);
}

async function getApprovalsForNFT(
  contractAddress: string,
  tokenId: string
): Promise<Approval[] | null> {
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
    // tx to getApproved reverted so return null, which will indicate to getNFTsForAccount to filter this token out
    // revert on getApproved means token is likely erc1155
    return null;
  }
}
