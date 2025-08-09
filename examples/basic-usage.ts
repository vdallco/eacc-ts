import { EACCClient, getNetworkAddresses } from '../src';
import { ethers } from 'ethers';
import { ARBITRUM_ONE_MAINNET } from '../src/constants/chains';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
  const chainId = ARBITRUM_ONE_MAINNET;
  const addresses = getNetworkAddresses(chainId);

  try {
    const client = new EACCClient({
      marketplaceV2Address: addresses.marketplaceV2,
      marketplaceDataV1Address: addresses.marketplaceDataV1,
      chainId,
      ipfsConfig: {
        gateway: 'https://ipfs.io/ipfs/',
        apiEndpoint: 'https://api.pinata.cloud'
      }
    });

    await client.connectWithPrivateKey(
       process.env.PRIVATE_KEY ?? ('0x' + '0'.repeat(64)),
       process.env.ARBITRUM_MAINNET_RPC_URL ?? 'https://arbitrum.drpc.org'
    );

    const address = await client.getAddress();
    console.log(`Connected to address: ${address}\n`);

    const isRegistered = await client.isUserRegistered(address);
    console.log(`User registered: ${isRegistered}\n`);

    if (!isRegistered) {
      console.log('User not registered. Register first before using the marketplace.');
      return;
    }

    const user = await client.getUser(address);
    console.log('User info:', {
      name: user.name,
      bio: user.bio,
      reputationUp: user.reputationUp,
      reputationDown: user.reputationDown
    });

    const rating = await client.getUserRating(address);
    console.log('User rating:', {
      averageRating: rating.averageRating, 
      numberOfReviews: rating.numberOfReviews.toString()
    });

    const jobsLength = await client.getJobsLength();
    console.log(`Total jobs in marketplace: ${jobsLength.toString()}`);

    const singleJob = await client.getJob(ethers.toBigInt(545));
    console.log('Single job:', singleJob);

    if (Number(jobsLength) > 0) {
      const startIndex = Number(jobsLength) > 5 ? (Number(jobsLength) - 5) : ethers.toBigInt(0);
      const jobs = await client.getJobs(startIndex as number, 5);
      
      console.log('\nRecent jobs:');
      jobs.forEach((job, index) => {
        console.log(`Job ${(startIndex as number + index).toString()}:`, {
          title: job.title,
          state: job.state, // 0=Open, 1=Taken, 2=Closed
          amount: job.amount,
          tags: job.tags,
        });
      });
    }

    const arbitratorsLength = await client.getArbitratorsLength();
    console.log(`Total arbitrators: ${arbitratorsLength.toString()}`);

    if (arbitratorsLength as number > 0) {
      const arbitrators = await client.getArbitrators(0, 3);
      console.log('\nAvailable arbitrators:');
      arbitrators.forEach((arbitrator, index) => {
        console.log(`Arbitrator ${index + 1}:`, {
          name: arbitrator.name,
          fee: arbitrator.fee,
          settledCount: arbitrator.settledCount,
          address: arbitrator.address_
        });
      });
    }

    console.log('\nBasic usage example completed.');

  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}