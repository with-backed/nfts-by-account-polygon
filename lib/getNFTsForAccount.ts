import { createAlchemyWeb3 } from "@alch/alchemy-web3";

export interface NFTEntity {
  id: string;
  identifier: string;
  uri?: string | null;
  registry: {
    symbol?: string | null;
    name?: string | null;
  };
  approvals: Approval[];
}

interface Approval {
  id: string;
  approved: {
    id: string;
  };
}

export async function getNFTsForAccount(owner: string): Promise<NFTEntity[]> {
  const web3 = createAlchemyWeb3(
    "https://opt-mainnet.g.alchemy.com/v2/_K-HnfZvE5ChalM8ys4TQEkmsWn8CPTU"
  );

  const nfts = await web3.alchemy.getNfts({
    owner,
  });

  return nfts.ownedNfts.map((nft) => ({
    id: nft.contract.address,
    identifier: nft.id.tokenId,
    registry: {
      name: nft.title,
    },
    uri: nft.tokenUri.raw,
    approvals: [],
  }));
}
