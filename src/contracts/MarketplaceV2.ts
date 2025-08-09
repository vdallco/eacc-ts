import { Contract, Signer, Provider, BigNumberish, ContractTransactionResponse } from 'ethers';
import { JobPost, PublishJobParams, UpdateJobParams, JobEventData } from '../types';

export const MARKETPLACE_V2_ABI = [
  "function jobs(uint256) view returns (tuple(uint8 state, bool whitelistWorkers, bool multipleApplicants, bool disputed, tuple(address creator, address worker, address arbitrator) roles, string title, string[] tags, bytes32 contentHash, address token, uint256 amount, uint32 timestamp, uint32 maxTime, string deliveryMethod, uint256 escrowId, bytes32 resultHash, uint8 rating, uint256 collateralOwed))",
  "function jobsLength() view returns (uint256)",
  "function getJob(uint256 jobId) view returns (tuple(uint8 state, bool whitelistWorkers, tuple(address creator, address arbitrator, address worker) roles, string title, string[] tags, bytes32 contentHash, bool multipleApplicants, uint256 amount, address token, uint32 timestamp, uint32 maxTime, string deliveryMethod, uint256 collateralOwed, uint256 escrowId, bytes32 resultHash, uint8 rating, bool disputed))",
  "function whitelistWorkers(uint256 jobId, address worker) view returns (bool)",
  "function version() view returns (uint256)",
  "function unicrowAddress() view returns (address)",
  "function treasuryAddress() view returns (address)",
  "function unicrowMarketplaceFee() view returns (uint16)",
  "function eaccToken() view returns (address)",
  "function eaccRewardTokensEnabled(address token) view returns (uint256)",
  "function eaccTokensPerToken() view returns (uint256)",
  "function marketplaceData() view returns (address)",

  "function publishJobPost(string title, bytes32 contentHash, bool multipleApplicants, string[] tags, address token, uint256 amount, uint32 maxTime, string deliveryMethod, address arbitrator, address[] allowedWorkers) returns (uint256)",
  "function updateJobPost(uint256 jobId, string title, bytes32 contentHash, string[] tags, uint256 amount, uint32 maxTime, address arbitrator, bool whitelistWorkers)",
  "function updateJobWhitelist(uint256 jobId, address[] allowedWorkers, address[] disallowedWorkers)",
  "function closeJob(uint256 jobId)",
  "function withdrawCollateral(uint256 jobId)",
  "function reopenJob(uint256 jobId)",
  "function takeJob(uint256 jobId, bytes signature)",
  "function payStartJob(uint256 jobId, address worker) payable",
  "function deliverResult(uint256 jobId, bytes32 resultHash)",
  "function approveResult(uint256 jobId, uint8 reviewRating, string reviewText)",
  "function refund(uint256 jobId)",
  "function dispute(uint256 jobId, bytes sessionKey, bytes content)",
  "function arbitrate(uint256 jobId, uint16 buyerShare, uint16 workerShare, bytes32 reasonHash)",
  "function refuseArbitration(uint256 jobId)",
  "function postThreadMessage(uint256 jobId, bytes32 contentHash, address recipient)",
  "function review(uint256 jobId, uint8 reviewRating, string reviewText)",

  "function pause()",
  "function unpause()",
  "function setTreasuryAddress(address treasuryAddress)",
  "function setUnicrowMarketplaceFee(uint16 unicrowMarketplaceFee)",
  "function updateUnicrowAddresses(address unicrowAddress, address unicrowDisputeAddress, address unicrowArbitratorAddress)",
  "function setEACCRewardTokensEnabled(address token, uint256 reward)",

  "event UnicrowAddressesChanged(address unicrowAddress, address unicrowDisputeAddress, address unicrowArbitratorAddress)",
  "event UnicrowMarketplaceFeeChanged(uint16 unicrowMarketplaceFee)",
  "event TreasuryAddressChanged(address treasuryAddress)",
  "event EACCRewardTokensEnabledChanged(address indexed token, uint256 amount)",
  "event EACCRewardsDistributed(uint256 indexed jobId, address indexed worker, address indexed creator, uint256 rewardAmount)"
];

export class MarketplaceV2Contract {
  private contract: Contract;

  constructor(address: string, signerOrProvider: Signer | Provider) {
    this.contract = new Contract(address, MARKETPLACE_V2_ABI, signerOrProvider);
  }

  async getJob(jobId: BigNumberish): Promise<JobPost> {
    return await this.contract.getJob(jobId);
  }

  async getJobsLength(): Promise<BigNumberish> {
    return await this.contract.jobsLength();
  }

  async isWorkerWhitelisted(jobId: BigNumberish, worker: string): Promise<boolean> {
    return await this.contract.whitelistWorkers(jobId, worker);
  }

  async getVersion(): Promise<BigNumberish> {
    return await this.contract.version();
  }

  async getUnicrowAddress(): Promise<string> {
    return await this.contract.unicrowAddress();
  }

  async getTreasuryAddress(): Promise<string> {
    return await this.contract.treasuryAddress();
  }

  async getMarketplaceFee(): Promise<number> {
    return await this.contract.unicrowMarketplaceFee();
  }

  async getEACCToken(): Promise<string> {
    return await this.contract.eaccToken();
  }

  async getEACCRewardTokensEnabled(token: string): Promise<BigNumberish> {
    return await this.contract.eaccRewardTokensEnabled(token);
  }

  async getEACCTokensPerToken(): Promise<BigNumberish> {
    return await this.contract.eaccTokensPerToken();
  }

  async getMarketplaceDataAddress(): Promise<string> {
    return await this.contract.marketplaceData();
  }

  async publishJobPost(params: PublishJobParams): Promise<ContractTransactionResponse> {
    const {
      title,
      contentHash,
      multipleApplicants,
      tags,
      token,
      amount,
      maxTime,
      deliveryMethod,
      arbitrator = '0x0000000000000000000000000000000000000000',
      allowedWorkers = []
    } = params;

    return await this.contract.publishJobPost(
      title,
      contentHash,
      multipleApplicants,
      tags,
      token,
      amount,
      maxTime,
      deliveryMethod,
      arbitrator,
      allowedWorkers
    );
  }

  async updateJobPost(params: UpdateJobParams) {
    const {
      jobId,
      title,
      contentHash,
      tags,
      amount,
      maxTime,
      arbitrator = '0x0000000000000000000000000000000000000000',
      whitelistWorkers
    } = params;

    return await this.contract.updateJobPost(
      jobId,
      title,
      contentHash,
      tags,
      amount,
      maxTime,
      arbitrator,
      whitelistWorkers
    );
  }

  async updateJobWhitelist(jobId: BigNumberish, allowedWorkers: string[], disallowedWorkers: string[]) {
    return await this.contract.updateJobWhitelist(jobId, allowedWorkers, disallowedWorkers);
  }

  async closeJob(jobId: BigNumberish) {
    return await this.contract.closeJob(jobId);
  }

  async withdrawCollateral(jobId: BigNumberish) {
    return await this.contract.withdrawCollateral(jobId);
  }

  async reopenJob(jobId: BigNumberish) {
    return await this.contract.reopenJob(jobId);
  }

  async takeJob(jobId: BigNumberish, signature: string) {
    return await this.contract.takeJob(jobId, signature);
  }

  async payStartJob(jobId: BigNumberish, worker: string, value?: BigNumberish) {
    return await this.contract.payStartJob(jobId, worker, { value });
  }

  async deliverResult(jobId: BigNumberish, resultHash: string) {
    return await this.contract.deliverResult(jobId, resultHash);
  }

  async approveResult(jobId: BigNumberish, reviewRating: number, reviewText: string) {
    return await this.contract.approveResult(jobId, reviewRating, reviewText);
  }

  async refund(jobId: BigNumberish) {
    return await this.contract.refund(jobId);
  }

  async dispute(jobId: BigNumberish, sessionKey: string, content: string) {
    return await this.contract.dispute(jobId, sessionKey, content);
  }

  async arbitrate(jobId: BigNumberish, buyerShare: number, workerShare: number, reasonHash: string) {
    return await this.contract.arbitrate(jobId, buyerShare, workerShare, reasonHash);
  }

  async refuseArbitration(jobId: BigNumberish) {
    return await this.contract.refuseArbitration(jobId);
  }

  async postThreadMessage(jobId: BigNumberish, contentHash: string, recipient: string) {
    return await this.contract.postThreadMessage(jobId, contentHash, recipient);
  }

  async review(jobId: BigNumberish, reviewRating: number, reviewText: string) {
    return await this.contract.review(jobId, reviewRating, reviewText);
  }

  async pause() {
    return await this.contract.pause();
  }

  async unpause() {
    return await this.contract.unpause();
  }

  async setTreasuryAddress(treasuryAddress: string) {
    return await this.contract.setTreasuryAddress(treasuryAddress);
  }

  async setUnicrowMarketplaceFee(fee: number) {
    return await this.contract.setUnicrowMarketplaceFee(fee);
  }

  async updateUnicrowAddresses(
    unicrowAddress: string,
    unicrowDisputeAddress: string,
    unicrowArbitratorAddress: string
  ) {
    return await this.contract.updateUnicrowAddresses(
      unicrowAddress,
      unicrowDisputeAddress,
      unicrowArbitratorAddress
    );
  }

  async setEACCRewardTokensEnabled(token: string, reward: BigNumberish) {
    return await this.contract.setEACCRewardTokensEnabled(token, reward);
  }

  onJobCreated(callback: (jobId: BigNumberish) => void) {
    // Note: The actual event might be emitted from MarketplaceDataV1
    // This is a placeholder for job creation events
    this.contract.on('JobCreated', callback);
  }

  onJobTaken(callback: (jobId: BigNumberish, worker: string) => void) {
    // Note: The actual event might be emitted from MarketplaceDataV1
    this.contract.on('JobTaken', callback);
  }

  onJobCompleted(callback: (jobId: BigNumberish) => void) {
    // Note: The actual event might be emitted from MarketplaceDataV1
    this.contract.on('JobCompleted', callback);
  }

  onJobDisputed(callback: (jobId: BigNumberish, disputer: string) => void) {
    // Note: The actual event might be emitted from MarketplaceDataV1
    this.contract.on('JobDisputed', callback);
  }

  onEACCRewardsDistributed(callback: (jobId: BigNumberish, worker: string, creator: string, rewardAmount: BigNumberish) => void) {
    this.contract.on('EACCRewardsDistributed', callback);
  }

  onUnicrowAddressesChanged(callback: (unicrowAddress: string, unicrowDisputeAddress: string, unicrowArbitratorAddress: string) => void) {
    this.contract.on('UnicrowAddressesChanged', callback);
  }

  onUnicrowMarketplaceFeeChanged(callback: (fee: number) => void) {
    this.contract.on('UnicrowMarketplaceFeeChanged', callback);
  }

  onTreasuryAddressChanged(callback: (treasuryAddress: string) => void) {
    this.contract.on('TreasuryAddressChanged', callback);
  }

  onEACCRewardTokensEnabledChanged(callback: (token: string, amount: BigNumberish) => void) {
    this.contract.on('EACCRewardTokensEnabledChanged', callback);
  }

  removeAllListeners() {
    this.contract.removeAllListeners();
  }

  getContract(): Contract {
    return this.contract;
  }
}