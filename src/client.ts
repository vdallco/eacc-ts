import { Signer, Provider, BigNumberish, ContractTransaction, JsonRpcProvider, BrowserProvider } from 'ethers';
import { MarketplaceV2Contract } from './contracts/MarketplaceV2';
import { MarketplaceDataV1Contract } from './contracts/MarketplaceDataV1';
import { WalletConnector } from './utils/wallet';
import { CryptoUtils } from './utils/crypto';
import { IPFSUtils, IPFSConfig } from './utils/ipfs';
import { getNetworkAddresses, isNetworkSupported } from './constants/addresses';
import {
  JobPost,
  User,
  JobArbitrator,
  UserRating,
  Review,
  JobEventData,
  PublishJobParams,
  UpdateJobParams,
  RegisterUserParams,
  UpdateUserParams,
  RegisterArbitratorParams,
  WalletProvider
} from './types';

export interface EACCClientConfig {
  marketplaceV2Address: string;
  marketplaceDataV1Address: string;
  chainId?: number;
  ipfsConfig?: IPFSConfig;
}

export class EACCClient {
  private marketplaceV2!: MarketplaceV2Contract;
  private marketplaceData!: MarketplaceDataV1Contract;
  private wallet: WalletConnector;
  private ipfs: IPFSUtils;
  private config: EACCClientConfig;

  constructor(config: EACCClientConfig, signerOrProvider?: Signer | Provider) {
    this.config = config;
    this.wallet = new WalletConnector();
    this.ipfs = new IPFSUtils(config.ipfsConfig);

    if (config.chainId && !isNetworkSupported(config.chainId)) {
      throw new Error(`Unsupported network: ${config.chainId}`);
    }

    if (signerOrProvider) {
      this.initializeContracts(signerOrProvider);
    }
  }

  private initializeContracts(signerOrProvider: Signer | Provider) {
    this.marketplaceV2 = new MarketplaceV2Contract(
      this.config.marketplaceV2Address, 
      signerOrProvider
    );
    this.marketplaceData = new MarketplaceDataV1Contract(
      this.config.marketplaceDataV1Address, 
      signerOrProvider
    );
  }

  async connectWithPrivateKey(privateKey: string, rpcUrl: string): Promise<void> {
    const signer = await this.wallet.connectWithPrivateKey(privateKey, rpcUrl);
    this.initializeContracts(signer);
  }

  async connectProvider(provider: JsonRpcProvider | BrowserProvider): Promise<void> {
    const signer = await this.wallet.connectWithProvider(provider);
    this.initializeContracts(signer);
  }

  async getAddress(): Promise<string> {
    return await this.wallet.getAddress();
  }

  async getBalance(): Promise<BigNumberish> {
    return await this.wallet.getBalance();
  }

  async registerUser(params: RegisterUserParams): Promise<any> {
    this.checkConnection();
    return await this.marketplaceData.registerUser(
      params.pubkey,
      params.name,
      params.bio,
      params.avatar
    );
  }

  async updateUser(params: UpdateUserParams): Promise<any> {
    this.checkConnection();
    return await this.marketplaceData.updateUser(
      params.name,
      params.bio,
      params.avatar
    );
  }

  async getUser(address: string): Promise<User> {
    return await this.marketplaceData.getUser(address);
  }

  async getUsers(index: number, limit: number): Promise<User[]> {
    return await this.marketplaceData.getUsers(index, limit);
  }

  async getUsersLength(): Promise<BigNumberish> {
    return await this.marketplaceData.getUsersLength();
  }

  async isUserRegistered(address: string): Promise<boolean> {
    return await this.marketplaceData.isUserRegistered(address);
  }

  async getUserRating(address: string): Promise<UserRating> {
    return await this.marketplaceData.getUserRating(address);
  }

  async getUserReviews(address: string, index: number, limit: number): Promise<Review[]> {
    return await this.marketplaceData.getReviews(address, index, limit);
  }

  async registerArbitrator(params: RegisterArbitratorParams): Promise<any> {
    this.checkConnection();
    return await this.marketplaceData.registerArbitrator(
      params.pubkey,
      params.name,
      params.bio,
      params.avatar,
      params.fee
    );
  }

  async updateArbitrator(params: UpdateUserParams): Promise<any> {
    this.checkConnection();
    return await this.marketplaceData.updateArbitrator(
      params.name,
      params.bio,
      params.avatar
    );
  }

  async getArbitrator(address: string): Promise<JobArbitrator> {
    return await this.marketplaceData.getArbitrator(address);
  }

  async getArbitrators(index: number, limit: number): Promise<JobArbitrator[]> {
    return await this.marketplaceData.getArbitrators(index, limit);
  }

  async getArbitratorsLength(): Promise<BigNumberish> {
    return await this.marketplaceData.getArbitratorsLength();
  }

  async isArbitratorRegistered(address: string): Promise<boolean> {
    return await this.marketplaceData.isArbitratorRegistered(address);
  }

  async publishJob(params: PublishJobParams): Promise<any> {
    this.checkConnection();
    return await this.marketplaceV2.publishJobPost(params);
  }

  async updateJob(params: UpdateJobParams): Promise<any> {
    this.checkConnection();
    return await this.marketplaceV2.updateJobPost(params);
  }

  async getJob(jobId: BigNumberish): Promise<JobPost> {
    return await this.marketplaceV2.getJob(jobId);
  }

  async getJobs(index: number, limit: number): Promise<JobPost[]> {
    return await this.marketplaceData.getJobs(index, limit);
  }

  async getJobsLength(): Promise<BigNumberish> {
    return await this.marketplaceV2.getJobsLength();
  }

  async closeJob(jobId: BigNumberish): Promise<any> {
    this.checkConnection();
    return await this.marketplaceV2.closeJob(jobId);
  }

  async reopenJob(jobId: BigNumberish): Promise<any> {
    this.checkConnection();
    return await this.marketplaceV2.reopenJob(jobId);
  }

  async withdrawCollateral(jobId: BigNumberish): Promise<any> {
    this.checkConnection();
    return await this.marketplaceV2.withdrawCollateral(jobId);
  }

  async updateJobWhitelist(
    jobId: BigNumberish, 
    allowedWorkers: string[], 
    disallowedWorkers: string[]
  ): Promise<ContractTransaction> {
    this.checkConnection();
    return await this.marketplaceV2.updateJobWhitelist(jobId, allowedWorkers, disallowedWorkers);
  }

  async isWorkerWhitelisted(jobId: BigNumberish, worker: string): Promise<boolean> {
    return await this.marketplaceV2.isWorkerWhitelisted(jobId, worker);
  }

  async takeJob(jobId: BigNumberish, signature: string): Promise<any> {
    this.checkConnection();
    return await this.marketplaceV2.takeJob(jobId, signature);
  }

  async payStartJob(jobId: BigNumberish, worker: string, value?: BigNumberish): Promise<any> {
    this.checkConnection();
    return await this.marketplaceV2.payStartJob(jobId, worker, value);
  }

  async deliverResult(jobId: BigNumberish, resultHash: string): Promise<any> {
    this.checkConnection();
    return await this.marketplaceV2.deliverResult(jobId, resultHash);
  }

  async approveResult(
    jobId: BigNumberish, 
    reviewRating: number, 
    reviewText: string
  ): Promise<ContractTransaction> {
    this.checkConnection();
    return await this.marketplaceV2.approveResult(jobId, reviewRating, reviewText);
  }

  async refund(jobId: BigNumberish): Promise<any> {
    this.checkConnection();
    return await this.marketplaceV2.refund(jobId);
  }

  async review(
    jobId: BigNumberish, 
    reviewRating: number, 
    reviewText: string
  ): Promise<ContractTransaction> {
    this.checkConnection();
    return await this.marketplaceV2.review(jobId, reviewRating, reviewText);
  }

  async dispute(
    jobId: BigNumberish, 
    sessionKey: string, 
    content: string
  ): Promise<ContractTransaction> {
    this.checkConnection();
    return await this.marketplaceV2.dispute(jobId, sessionKey, content);
  }

  async arbitrate(
    jobId: BigNumberish, 
    buyerShare: number, 
    workerShare: number, 
    reasonHash: string
  ): Promise<ContractTransaction> {
    this.checkConnection();
    return await this.marketplaceV2.arbitrate(jobId, buyerShare, workerShare, reasonHash);
  }

  async refuseArbitration(jobId: BigNumberish): Promise<ContractTransaction> {
    this.checkConnection();
    return await this.marketplaceV2.refuseArbitration(jobId);
  }

  async postMessage(
    jobId: BigNumberish, 
    contentHash: string, 
    recipient: string
  ): Promise<ContractTransaction> {
    this.checkConnection();
    return await this.marketplaceV2.postThreadMessage(jobId, contentHash, recipient);
  }

  async getEvents(jobId: BigNumberish, index: number, limit: number): Promise<JobEventData[]> {
    return await this.marketplaceData.getEvents(jobId, index, limit);
  }

  async getEventsLength(jobId: BigNumberish): Promise<BigNumberish> {
    return await this.marketplaceData.getEventsLength(jobId);
  }

  async readMeceTag(shortForm: string): Promise<string> {
    return await this.marketplaceData.readMeceTag(shortForm);
  }

  async updateMeceTag(shortForm: string, longForm: string): Promise<ContractTransaction> {
    this.checkConnection();
    return await this.marketplaceData.updateMeceTag(shortForm, longForm);
  }

  async removeMeceTag(shortForm: string): Promise<ContractTransaction> {
    this.checkConnection();
    return await this.marketplaceData.removeMeceTag(shortForm);
  }

  async uploadToIPFS(content: string | object, apiKey?: string): Promise<string> {
    return await this.ipfs.uploadToIPFS(content, apiKey);
  }

  async fetchFromIPFS(hash: string): Promise<string> {
    return await this.ipfs.fetchFromIPFS(hash);
  }

  async fetchJobContent(contentHash: string): Promise<any> {
    try {
      const ipfsHash = this.ipfs.bytes32ToHash(contentHash);
      const content = await this.ipfs.fetchFromIPFS(ipfsHash);
      return JSON.parse(content);
    } catch (error) {
      return await this.ipfs.fetchFromIPFS(contentHash);
    }
  }

  async signMessage(message: string): Promise<string> {
    this.checkConnection();
    const signer = this.wallet.getSigner();
    if (!signer) throw new Error('No signer available');
    return await CryptoUtils.signMessage(signer, message);
  }

  async createJobSignature(eventsLength: number, jobId: BigNumberish): Promise<string> {
    this.checkConnection();
    const signer = this.wallet.getSigner();
    if (!signer) throw new Error('No signer available');
    
    const messageHash = CryptoUtils.createJobSignatureHash(eventsLength, jobId);
    return await signer.signMessage(messageHash);
  }

  async getMarketplaceInfo() {
    return {
      version: await this.marketplaceV2.getVersion(),
      unicrowAddress: await this.marketplaceV2.getUnicrowAddress(),
      treasuryAddress: await this.marketplaceV2.getTreasuryAddress(),
      marketplaceFee: await this.marketplaceV2.getMarketplaceFee(),
      eaccToken: await this.marketplaceV2.getEACCToken(),
      eaccTokensPerToken: await this.marketplaceV2.getEACCTokensPerToken()
    };
  }

  async getEACCRewardForToken(token: string): Promise<BigNumberish> {
    return await this.marketplaceV2.getEACCRewardTokensEnabled(token);
  }

  onJobCreated(callback: (jobId: BigNumberish) => void) {
    this.marketplaceV2.onJobCreated(callback);
  }

  onJobTaken(callback: (jobId: BigNumberish, worker: string) => void) {
    this.marketplaceV2.onJobTaken(callback);
  }

  onJobCompleted(callback: (jobId: BigNumberish) => void) {
    this.marketplaceV2.onJobCompleted(callback);
  }

  onJobDisputed(callback: (jobId: BigNumberish, disputer: string) => void) {
    this.marketplaceV2.onJobDisputed(callback);
  }

  onEACCRewardsDistributed(callback: (jobId: BigNumberish, worker: string, creator: string, rewardAmount: BigNumberish) => void) {
    this.marketplaceV2.onEACCRewardsDistributed(callback);
  }

  onUserRegistered(callback: (addr: string, pubkey: string, name: string, bio: string, avatar: string) => void) {
    this.marketplaceData.onUserRegistered(callback);
  }

  onUserUpdated(callback: (addr: string, name: string, bio: string, avatar: string) => void) {
    this.marketplaceData.onUserUpdated(callback);
  }

  onArbitratorRegistered(callback: (addr: string, pubkey: string, name: string, bio: string, avatar: string, fee: number) => void) {
    this.marketplaceData.onArbitratorRegistered(callback);
  }

  onJobEvent(callback: (jobId: BigNumberish, eventData: JobEventData) => void) {
    this.marketplaceData.onJobEvent(callback);
  }

  onAccountsChanged(callback: (accounts: string[]) => void) {
    this.wallet.onAccountsChanged(callback);
  }

  onChainChanged(callback: (chainId: string) => void) {
    this.wallet.onChainChanged(callback);
  }

  removeAllListeners() {
    this.marketplaceV2.removeAllListeners();
    this.marketplaceData.removeAllListeners();
  }

  disconnect() {
    this.removeAllListeners();
    this.wallet.disconnect();
  }

  private checkConnection() {
    if (!this.wallet.getSigner()) {
      throw new Error('Wallet not connected. Call connectMetaMask() or connectWithPrivateKey() first.');
    }
  }

  static async createWithPrivateKey(
    config: EACCClientConfig, 
    privateKey: string, 
    rpcUrl: string
  ): Promise<EACCClient> {
    const client = new EACCClient(config);
    await client.connectWithPrivateKey(privateKey, rpcUrl);
    return client;
  }

  static createWithProvider(
    config: EACCClientConfig, 
    signerOrProvider: Signer | Provider
  ): EACCClient {
    return new EACCClient(config, signerOrProvider);
  }

  static getNetworkAddresses = getNetworkAddresses;
  static isNetworkSupported = isNetworkSupported;
}