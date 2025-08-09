import { ethers, Signer, JsonRpcProvider, BrowserProvider } from 'ethers';

export interface WalletConnectionResult {
 signer: Signer;
 address: string;
 chainId: number;
}

export class WalletConnector {
 private provider: JsonRpcProvider | BrowserProvider | null = null;
 private signer: Signer | null = null;

 async connectWithSigner(signer: Signer): Promise<Signer> {
   this.signer = signer;
   this.provider = signer.provider as any;
   return signer;
 }

 async connectWithProvider(provider: JsonRpcProvider | BrowserProvider): Promise<Signer> {
   this.provider = provider;
   this.signer = await provider.getSigner();
   return this.signer;
 }

 async connectWithPrivateKey(privateKey: string, rpcUrl: string): Promise<Signer> {
   try {
     if (!privateKey.startsWith('0x')) {
       privateKey = '0x' + privateKey;
     }
     
     if (privateKey.length !== 66) {
       throw new Error('Invalid private key length. Must be 64 hex characters (32 bytes).');
     }

     this.provider = new JsonRpcProvider(rpcUrl);
     this.signer = new ethers.Wallet(privateKey, this.provider);
     
     const address = await this.signer.getAddress();
     const network = await this.provider.getNetwork();
     
     console.log(`Connected with private key: ${address} on network ${network.chainId}`);
     
     return this.signer;
   } catch (error: any) {
     throw new Error(`Failed to connect with private key: ${error.message}`);
   }
 }

 async connectWithMnemonic(mnemonic: string, rpcUrl: string): Promise<Signer> {
   try {
     this.provider = new JsonRpcProvider(rpcUrl);
     
     const wallet = ethers.Wallet.fromPhrase(mnemonic);
     this.signer = wallet;
     
     const address = await this.getAddress();
     const network = await this.provider.getNetwork();
     
     console.log(`Connected with mnemonic: ${address} on network ${network.chainId}`);
     
     return this.signer;
   } catch (error: any) {
     throw new Error(`Failed to connect with mnemonic: ${error.message}`);
   }
 }

 getSigner(): Signer | null {
   return this.signer;
 }

 getProvider(): JsonRpcProvider | BrowserProvider | null {
   return this.provider;
 }

 async getAddress(): Promise<string> {
   if (!this.signer) {
     throw new Error('Wallet not connected');
   }
   return await this.signer.getAddress();
 }

 async getBalance(): Promise<bigint> {
   if (!this.signer) {
     throw new Error('Wallet not connected');
   }
   return await this.signer.provider!.getBalance(await this.signer.getAddress());
 }

 async getChainId(): Promise<bigint> {
   if (!this.provider) {
     throw new Error('Provider not available');
   }
   const network = await this.provider.getNetwork();
   return network.chainId;
 }

 async getGasPrice(): Promise<bigint> {
   if (!this.provider) {
     throw new Error('Provider not available');
   }
   const feeData = await this.provider.getFeeData();
   return feeData.gasPrice || 0n;
 }

 async estimateGas(transaction: any): Promise<bigint> {
   if (!this.provider) {
     throw new Error('Provider not available');
   }
   return await this.provider.estimateGas(transaction);
 }

 async getTransactionCount(address?: string): Promise<number> {
   if (!this.provider) {
     throw new Error('Provider not available');
   }
   
   const targetAddress = address || await this.getAddress();
   return await this.provider.getTransactionCount(targetAddress);
 }

 async getTransaction(hash: string) {
   if (!this.provider) {
     throw new Error('Provider not available');
   }
   return await this.provider.getTransaction(hash);
 }

 async getTransactionReceipt(hash: string) {
   if (!this.provider) {
     throw new Error('Provider not available');
   }
   return await this.provider.getTransactionReceipt(hash);
 }

 async waitForTransaction(hash: string, confirmations = 1) {
   if (!this.provider) {
     throw new Error('Provider not available');
   }
   return await this.provider.waitForTransaction(hash, confirmations);
 }

 onAccountsChanged(callback: (accounts: string[]) => void) {
   // Event handling would need to be implemented by the provider
   console.warn('Account change events not implemented for this provider type');
 }

 onChainChanged(callback: (chainId: string) => void) {
   // Event handling would need to be implemented by the provider
   console.warn('Chain change events not implemented for this provider type');
 }

 onConnect(callback: (connectInfo: { chainId: string }) => void) {
   // Event handling would need to be implemented by the provider
   console.warn('Connect events not implemented for this provider type');
 }

 onDisconnect(callback: (error: { code: number; message: string }) => void) {
   // Event handling would need to be implemented by the provider
   console.warn('Disconnect events not implemented for this provider type');
 }

 removeListener(event: string, callback: (...args: any[]) => void) {
   // Event handling would need to be implemented by the provider
   console.warn('Event listener removal not implemented for this provider type');
 }

 removeAllListeners() {
   // Event handling would need to be implemented by the provider
   console.warn('Remove all listeners not implemented for this provider type');
 }

 disconnect() {
   this.removeAllListeners();
   this.provider = null;
   this.signer = null;
 }

 isConnected(): boolean {
   return this.signer !== null;
 }

 async getConnectionInfo(): Promise<WalletConnectionResult | null> {
   if (!this.signer || !this.provider) {
     return null;
   }

   try {
     const address = await this.signer.getAddress();
     const network = await this.provider.getNetwork();
     
     return {
       signer: this.signer,
       address,
       chainId: Number(network.chainId)
     };
   } catch (error) {
     return null;
   }
 }

 static isValidPrivateKey(privateKey: string): boolean {
   try {
     if (!privateKey.startsWith('0x')) {
       privateKey = '0x' + privateKey;
     }
     return privateKey.length === 66 && /^0x[0-9a-fA-F]{64}$/.test(privateKey);
   } catch {
     return false;
   }
 }

 static isValidAddress(address: string): boolean {
   return ethers.isAddress(address);
 }

 static formatEther(value: bigint): string {
   return ethers.formatEther(value);
 }

 static parseEther(value: string): bigint {
   return ethers.parseEther(value);
 }

 static generateRandomWallet() {
    return ethers.Wallet.createRandom();
 }
}