export interface NetworkAddresses {
    marketplaceV2: string;
    marketplaceDataV1: string;
    unicrow: string;
    unicrowDispute: string;
    unicrowArbitrator: string;
    eaccToken: string;
  }
  
  export const NETWORK_ADDRESSES: Record<number, NetworkAddresses> = {
    // Arbitrum One
    42161: {
      marketplaceV2: '0x405AcFbD1400A168fDd4aDA2D214e8Ae5FF7a624',
      marketplaceDataV1: '0x0191ae69d05F11C7978cCCa2DE15653BaB509d9a',
      unicrow: '0x0000000000000000000000000000000000000000',  // TODO: Add real address
      unicrowDispute: '0x0000000000000000000000000000000000000000', // TODO: Add real address
      unicrowArbitrator: '0x0000000000000000000000000000000000000000', // TODO: Add real address
      eaccToken: '0x9Eeab030a17528eFb2aC0F81D76fab8754e461BD'
    },
  };
  
  export function getNetworkAddresses(chainId: number): NetworkAddresses {
    const addresses = NETWORK_ADDRESSES[chainId];
    if (!addresses) {
      throw new Error(`Unsupported network: ${chainId}`);
    }
    return addresses;
  }
  
  export const SUPPORTED_NETWORKS = Object.keys(NETWORK_ADDRESSES).map(Number);
  
  export function isNetworkSupported(chainId: number): boolean {
    return SUPPORTED_NETWORKS.includes(chainId);
  }