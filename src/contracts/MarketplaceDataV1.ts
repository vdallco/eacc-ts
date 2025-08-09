import { Contract, Signer, Provider, BigNumberish } from 'ethers';
import { User, JobArbitrator, UserRating, Review, JobEventData, JobPost } from '../types';

export const MARKETPLACE_DATA_V1_ABI = [
  "function users(address) view returns (tuple(address address_, bytes publicKey, string name, string bio, string avatar, uint16 reputationUp, uint16 reputationDown))",
  "function arbitrators(address) view returns (tuple(address address_, bytes publicKey, string name, string bio, string avatar, uint16 fee, uint16 settledCount, uint16 refusedCount))",
  "function userRatings(address) view returns (tuple(uint16 averageRating, uint256 numberOfReviews))",
  "function userReviews(address, uint256) view returns (tuple(address reviewer, uint256 jobId, uint8 rating, string text, uint32 timestamp))",
  "function jobEvents(uint256, uint256) view returns (tuple(uint8 type_, bytes address_, bytes data_, uint32 timestamp_))",
  "function meceTags(string) view returns (string)",
  
  "function getUsers(uint256 index, uint256 limit) view returns (tuple(address address_, bytes publicKey, string name, string bio, string avatar, uint16 reputationUp, uint16 reputationDown)[])",
  "function getArbitrators(uint256 index, uint256 limit) view returns (tuple(address address_, bytes publicKey, string name, string bio, string avatar, uint16 fee, uint16 settledCount, uint16 refusedCount)[])",
  "function getReviews(address target, uint256 index, uint256 limit) view returns (tuple(address reviewer, uint256 jobId, uint8 rating, string text, uint32 timestamp)[])",
  "function getEvents(uint256 jobId, uint256 index, uint256 limit) view returns (tuple(uint8 type_, bytes address_, bytes data_, uint32 timestamp_)[])",
  "function getJobs(uint256 index, uint256 limit) view returns (tuple(uint8 state, bool whitelistWorkers, tuple(address creator, address arbitrator, address worker) roles, string title, string[] tags, bytes32 contentHash, bool multipleApplicants, uint256 amount, address token, uint32 timestamp, uint32 maxTime, string deliveryMethod, uint256 collateralOwed, uint256 escrowId, bytes32 resultHash, uint8 rating, bool disputed)[])",
  "function getJob(uint256 jobId) view returns (tuple(uint8 state, bool whitelistWorkers, bool multipleApplicants, bool disputed, tuple(address creator, address worker, address arbitrator) roles, string title, string[] tags, bytes32 contentHash, address token, uint256 amount, uint32 timestamp, uint32 maxTime, string deliveryMethod, uint256 escrowId, bytes32 resultHash, uint8 rating, uint256 collateralOwed))",
  
  "function eventsLength(uint256 jobId) view returns (uint256)",
  "function usersLength() view returns (uint256)",
  "function arbitratorsLength() view returns (uint256)",
  "function jobsLength() view returns (uint256)",
  
  "function userRegistered(address) view returns (bool)",
  "function arbitratorRegistered(address) view returns (bool)",
  
  "function getUser(address userAddress) view returns (tuple(address address_, bytes publicKey, string name, string bio, string avatar, uint16 reputationUp, uint16 reputationDown))",
  "function getArbitrator(address arbitratorAddress) view returns (tuple(address address_, bytes publicKey, string name, string bio, string avatar, uint16 fee, uint16 settledCount, uint16 refusedCount))",
  "function getUserRating(address userAddress) view returns (tuple(uint16 averageRating, uint256 numberOfReviews))",
  "function readMeceTag(string shortForm) view returns (string)",
  "function publicKeys(address userAddress) view returns (bytes)",
  "function getArbitratorFee(address) view returns (uint16)",

  "function registerUser(bytes pubkey, string name, string bio, string avatar)",
  "function updateUser(string name, string bio, string avatar)",
  "function registerArbitrator(bytes pubkey, string name, string bio, string avatar, uint16 fee)",
  "function updateArbitrator(string name, string bio, string avatar)",
  "function updateMeceTag(string shortForm, string longForm)",
  "function removeMeceTag(string shortForm)",
  
  "function publishJobEvent(uint256 jobId, tuple(uint8 type_, bytes address_, bytes data_, uint32 timestamp_) event)",
  "function userRefunded(address)",
  "function userDelivered(address)",
  "function arbitratorRefused(address)",
  "function arbitratorSettled(address)",
  "function updateUserRating(address userAddress, uint8 reviewRating)",
  "function addReview(address target, address reviewer, uint256 jobId, uint8 rating, string text)",

  "event UserRegistered(address indexed addr, bytes pubkey, string name, string bio, string avatar)",
  "event UserUpdated(address indexed addr, string name, string bio, string avatar)",
  "event ArbitratorRegistered(address indexed addr, bytes pubkey, string name, string bio, string avatar, uint16 fee)",
  "event ArbitratorUpdated(address indexed addr, string name, string bio, string avatar)",
  "event JobEvent(uint256 indexed jobId, tuple(uint8 type_, bytes address_, bytes data_, uint32 timestamp_) eventData)",
  "event MarketplaceAddressChanged(address marketplaceAddress)"
];

export class MarketplaceDataV1Contract {
  private contract: Contract;

  constructor(address: string, signerOrProvider: Signer | Provider) {
    this.contract = new Contract(address, MARKETPLACE_DATA_V1_ABI, signerOrProvider);
  }

  async getUser(address: string): Promise<User> {
    return await this.contract.getUser(address);
  }

  async getUsers(index: number, limit: number): Promise<User[]> {
    return await this.contract.getUsers(index, limit);
  }

  async getUsersLength(): Promise<BigNumberish> {
    return await this.contract.usersLength();
  }

  async isUserRegistered(address: string): Promise<boolean> {
    return await this.contract.userRegistered(address);
  }

  async getUserRating(address: string): Promise<UserRating> {
    return await this.contract.getUserRating(address);
  }

  async getUserPublicKey(address: string): Promise<string> {
    return await this.contract.publicKeys(address);
  }

  async registerUser(pubkey: string, name: string, bio: string, avatar: string) {
    return await this.contract.registerUser(pubkey, name, bio, avatar);
  }

  async updateUser(name: string, bio: string, avatar: string) {
    return await this.contract.updateUser(name, bio, avatar);
  }

  async getArbitrator(address: string): Promise<JobArbitrator> {
    return await this.contract.getArbitrator(address);
  }

  async getArbitrators(index: number, limit: number): Promise<JobArbitrator[]> {
    return await this.contract.getArbitrators(index, limit);
  }

  async getArbitratorsLength(): Promise<BigNumberish> {
    return await this.contract.arbitratorsLength();
  }

  async isArbitratorRegistered(address: string): Promise<boolean> {
    return await this.contract.arbitratorRegistered(address);
  }

  async getArbitratorFee(address: string): Promise<number> {
    return await this.contract.getArbitratorFee(address);
  }

  async registerArbitrator(pubkey: string, name: string, bio: string, avatar: string, fee: number) {
    return await this.contract.registerArbitrator(pubkey, name, bio, avatar, fee);
  }

  async updateArbitrator(name: string, bio: string, avatar: string) {
    return await this.contract.updateArbitrator(name, bio, avatar);
  }

  async getJob(jobId: BigNumberish): Promise<JobPost> {
    return await this.contract.getJob(jobId);
  }

  async getJobs(index: number, limit: number): Promise<JobPost[]> {
    return await this.contract.getJobs(index, limit);
  }

  async getJobsLength(): Promise<BigNumberish> {
    return await this.contract.jobsLength();
  }

  async getReviews(target: string, index: number, limit: number): Promise<Review[]> {
    return await this.contract.getReviews(target, index, limit);
  }

  async getEvents(jobId: BigNumberish, index: number, limit: number): Promise<JobEventData[]> {
    return await this.contract.getEvents(jobId, index, limit);
  }

  async getEventsLength(jobId: BigNumberish): Promise<BigNumberish> {
    return await this.contract.eventsLength(jobId);
  }

  async publishJobEvent(jobId: BigNumberish, eventData: JobEventData) {
    return await this.contract.publishJobEvent(jobId, eventData);
  }

  async readMeceTag(shortForm: string): Promise<string> {
    return await this.contract.readMeceTag(shortForm);
  }

  async getMeceTag(shortForm: string): Promise<string> {
    return await this.contract.meceTags(shortForm);
  }

  async updateMeceTag(shortForm: string, longForm: string) {
    return await this.contract.updateMeceTag(shortForm, longForm);
  }

  async removeMeceTag(shortForm: string) {
    return await this.contract.removeMeceTag(shortForm);
  }

  async userRefunded(address: string) {
    return await this.contract.userRefunded(address);
  }

  async userDelivered(address: string) {
    return await this.contract.userDelivered(address);
  }

  async arbitratorRefused(address: string) {
    return await this.contract.arbitratorRefused(address);
  }

  async arbitratorSettled(address: string) {
    return await this.contract.arbitratorSettled(address);
  }

  async updateUserRating(userAddress: string, reviewRating: number) {
    return await this.contract.updateUserRating(userAddress, reviewRating);
  }

  async addReview(target: string, reviewer: string, jobId: BigNumberish, rating: number, text: string) {
    return await this.contract.addReview(target, reviewer, jobId, rating, text);
  }

  onUserRegistered(callback: (addr: string, pubkey: string, name: string, bio: string, avatar: string) => void) {
    this.contract.on('UserRegistered', callback);
  }

  onUserUpdated(callback: (addr: string, name: string, bio: string, avatar: string) => void) {
    this.contract.on('UserUpdated', callback);
  }

  onArbitratorRegistered(callback: (addr: string, pubkey: string, name: string, bio: string, avatar: string, fee: number) => void) {
    this.contract.on('ArbitratorRegistered', callback);
  }

  onArbitratorUpdated(callback: (addr: string, name: string, bio: string, avatar: string) => void) {
    this.contract.on('ArbitratorUpdated', callback);
  }

  onJobEvent(callback: (jobId: BigNumberish, eventData: JobEventData) => void) {
    this.contract.on('JobEvent', callback);
  }

  onMarketplaceAddressChanged(callback: (marketplaceAddress: string) => void) {
    this.contract.on('MarketplaceAddressChanged', callback);
  }

  onJobCreated(callback: (jobId: BigNumberish, eventData: JobEventData) => void) {
    this.contract.on('JobEvent', (jobId: BigNumberish, eventData: JobEventData) => {
      if (eventData.type_ === 0) { // JobEventType.Created
        callback(jobId, eventData);
      }
    });
  }

  onJobTaken(callback: (jobId: BigNumberish, eventData: JobEventData) => void) {
    this.contract.on('JobEvent', (jobId: BigNumberish, eventData: JobEventData) => {
      if (eventData.type_ === 1) { // JobEventType.Taken
        callback(jobId, eventData);
      }
    });
  }

  onJobCompleted(callback: (jobId: BigNumberish, eventData: JobEventData) => void) {
    this.contract.on('JobEvent', (jobId: BigNumberish, eventData: JobEventData) => {
      if (eventData.type_ === 5) { // JobEventType.Completed
        callback(jobId, eventData);
      }
    });
  }

  onJobDisputed(callback: (jobId: BigNumberish, eventData: JobEventData) => void) {
    this.contract.on('JobEvent', (jobId: BigNumberish, eventData: JobEventData) => {
      if (eventData.type_ === 11) { // JobEventType.Disputed
        callback(jobId, eventData);
      }
    });
  }

  removeAllListeners() {
    this.contract.removeAllListeners();
  }

  getContract(): Contract {
    return this.contract;
  }
}