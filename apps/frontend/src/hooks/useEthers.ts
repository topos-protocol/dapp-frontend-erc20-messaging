import { ethers } from 'ethers';
import React from 'react';
import { useMetaMask } from 'metamask-react';

import { Subnet } from '../types';

interface Args {
  subnet?: Subnet;
  viaMetaMask?: boolean;
}

export default function useEthers({ subnet, viaMetaMask }: Args = {}) {
  const { account, addChain, connect, ethereum, switchChain } = useMetaMask();

  const [provider] = React.useState<
    ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
  >(
    viaMetaMask && ethereum
      ? new ethers.providers.Web3Provider(ethereum)
      : new ethers.providers.JsonRpcProvider(
          subnet?.endpoint || import.meta.env.VITE_TOPOS_SUBNET_ENDPOINT
        )
  );

  const getSigner = React.useCallback(async () => {
    if (subnet && viaMetaMask && ethereum) {
      const chainId = ethers.utils.hexStripZeros(subnet.chainId.toHexString());

      if (ethereum.networkVersion !== chainId) {
        try {
          await switchChain(chainId);
        } catch (err: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (err.code === 4902) {
            await addChain({
              chainName: subnet.name,
              chainId,
              nativeCurrency: {
                name: subnet.currencySymbol,
                symbol: subnet.currencySymbol,
                decimals: 18,
              },
              rpcUrls: [subnet.endpoint],
            });
          }
        }
      }
      if (!account) {
        await connect();
      }
    }
  }, [subnet, ethereum]);

  React.useEffect(() => {
    getSigner();
  }, [getSigner]);

  return {
    provider,
  };
}
