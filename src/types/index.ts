import { BigNumberish } from 'ethers';

export interface JobPost {
    state: number;
    whitelistWorkers: boolean;
    roles: {
      creator: string;
      worker: string;
      arbitrator: string;
    };
    title: string;
    tags: string[];
    contentHash: string;
    multipleApplicants: boolean;
    amount: BigNumberish;
    token: string;
    timestamp: number;
    maxTime: number;
    deliveryMethod: string;
    collateralOwed: BigNumberish;
    escrowId: BigNumberish;
    resultHash: string;
    rating: number;
    disputed: boolean;
  }

export interface User {
  address_: string;
  publicKey: string;
  name: string;
  bio: string;
  avatar: string;
  reputationUp: number;
  reputationDown: number;
}

export interface JobArbitrator {
  address_: string;
  publicKey: string;
  name: string;
  bio: string;
  avatar: string;
  fee: number;
  settledCount: number;
  refusedCount: number;
}

export interface UserRating {
  averageRating: number;
  numberOfReviews: BigNumberish;
}

export interface Review {
  reviewer: string;
  jobId: BigNumberish;
  rating: number;
  text: string;
  timestamp: number;
}

export interface JobEventData {
  type_: number;
  address_: string;
  data_: string;
  timestamp_: number;
}

export enum JobState {
  Open = 0,
  Taken = 1,
  Closed = 2
}

export enum JobEventType {
  Created = 0,
  Taken = 1,
  Paid = 2,
  Updated = 3,
  Signed = 4,
  Completed = 5,
  Delivered = 6,
  Closed = 7,
  Reopened = 8,
  Rated = 9,
  Refunded = 10,
  Disputed = 11,
  Arbitrated = 12,
  ArbitrationRefused = 13,
  WhitelistedWorkerAdded = 14,
  WhitelistedWorkerRemoved = 15,
  CollateralWithdrawn = 16,
  WorkerMessage = 17,
  OwnerMessage = 18
}

export interface PublishJobParams {
  title: string;
  contentHash: string;
  multipleApplicants: boolean;
  tags: string[];
  token: string;
  amount: BigNumberish;
  maxTime: number;
  deliveryMethod: string;
  arbitrator?: string;
  allowedWorkers?: string[];
}

export interface UpdateJobParams {
  jobId: BigNumberish;
  title: string;
  contentHash: string;
  tags: string[];
  amount: BigNumberish;
  maxTime: number;
  arbitrator?: string;
  whitelistWorkers: boolean;
}

export interface RegisterUserParams {
  pubkey: string;
  name: string;
  bio: string;
  avatar: string;
}

export interface UpdateUserParams {
  name: string;
  bio: string;
  avatar: string;
}

export interface RegisterArbitratorParams {
  pubkey: string;
  name: string;
  bio: string;
  avatar: string;
  fee: number;
}

export interface WalletProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, callback: (...args: any[]) => void) => void;
  removeListener?: (event: string, callback: (...args: any[]) => void) => void;
}

export const MECE_TAGS = {
  DA: 'DIGITAL_AUDIO',
  DV: 'DIGITAL_VIDEO', 
  DT: 'DIGITAL_TEXT',
  DS: 'DIGITAL_SOFTWARE',
  DO: 'DIGITAL_OTHERS',
  NDG: 'NON_DIGITAL_GOODS',
  NDS: 'NON_DIGITAL_SERVICES',
  NDO: 'NON_DIGITAL_OTHERS'
} as const;

export type MeceTag = keyof typeof MECE_TAGS;