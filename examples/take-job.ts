import { EACCClient, getNetworkAddresses, JobState } from '../src';
import { ethers } from 'ethers';
import { ARBITRUM_ONE_MAINNET } from '../src/constants/chains';

async function main() {
  const chainId = ARBITRUM_ONE_MAINNET
  const addresses = getNetworkAddresses(chainId);

  try {
    const client = new EACCClient({
      marketplaceV2Address: addresses.marketplaceV2,
      marketplaceDataV1Address: addresses.marketplaceDataV1,
      chainId
    });

    await client.connectWithPrivateKey(
      '0x' + '1'.repeat(64),
      'https://goerli.infura.io/v3/YOUR_INFURA_KEY'
    );

    const workerAddress = await client.getAddress();
    console.log(`Connected as worker: ${workerAddress}\n`);

    const isRegistered = await client.isUserRegistered(workerAddress);
    if (!isRegistered) {
      console.log('Worker not registered. Please register first.');
      return;
    }

    const jobsLength = await client.getJobsLength();
    console.log(`Total jobs: ${jobsLength.toString()}`);

    if (jobsLength == 0) {
      console.log('No jobs available. Create a job first.');
      return;
    }

    let targetJobId: ethers.BigNumberish | null = null;
    let targetJob: any = null;

    for (let i = Number(jobsLength) - 1; i >= 0; i--) {
      const job = await client.getJob(ethers.toBigInt(i));
      
      if (job.state === JobState.Open && job.roles.creator !== workerAddress) {
        if (job.whitelistWorkers) {
          const isWhitelisted = await client.isWorkerWhitelisted(
            ethers.toBigInt(i), 
            workerAddress
          );
          if (!isWhitelisted) {
            console.log(`⚠️ Job ${i} requires whitelist approval`);
            continue;
          }
        }

        targetJobId = ethers.toBigInt(i);
        targetJob = job;
        break;
      }
    }

    if (!targetJobId || !targetJob) {
      console.log('No suitable open jobs found.');
      return;
    }

    console.log(`Found suitable job: ${targetJobId.toString()}`);
    console.log('Job details:', {
      title: targetJob.title,
      amount: ethers.formatEther(targetJob.amount) + ' ETH',
      maxTime: targetJob.maxTime / 86400 + ' days',
      tags: targetJob.tags,
      creator: targetJob.roles.creator,
      multipleApplicants: targetJob.multipleApplicants
    });

    console.log('\nPreparing job signature...');
    const eventsLength = await client.getEventsLength(targetJobId);
    console.log(`Current events for job: ${eventsLength.toString()}`);

    const messageHash = ethers.solidityPackedKeccak256(
      ['uint256', 'uint256'],
      [eventsLength, targetJobId]
    );
    
    const signature = await client.signMessage(messageHash);
    console.log(`✍️ Signature created: ${signature.slice(0, 20)}...`);

    console.log('\nTaking the job...');
    try {
      const tx = await client.takeJob(targetJobId, signature);
      console.log(`Transaction sent: ${tx.hash}`);
      
      console.log('Waiting for confirmation...');
      const receipt = await tx.wait();
      console.log(`Job taken! Transaction confirmed in block ${receipt.blockNumber}`);

      const updatedJob = await client.getJob(targetJobId);
      
      if (updatedJob.state === JobState.Taken && updatedJob.roles.worker === workerAddress) {
        console.log('\nSuccess! You are now assigned to this job.');
        console.log('Job status:', {
          state: 'TAKEN',
          worker: updatedJob.roles.worker,
          escrowId: updatedJob.escrowId.toString()
        });

        await simulateWorkAndDelivery(client, targetJobId, targetJob);

      } else {
        console.log('Job taking failed - status not updated correctly');
      }

    } catch (error) {
      console.error('Failed to take job:', error);
      
      if (error.message.includes('not registered')) {
        console.log('Solution: Register as a user first');
      } else if (error.message.includes('not whitelisted')) {
        console.log('Solution: Ask job creator to whitelist you');
      } else if (error.message.includes('invalid signature')) {
        console.log('Solution: Check signature creation process');
      } else if (error.message.includes('not open')) {
        console.log('Solution: Job may have been taken by another worker');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

async function simulateWorkAndDelivery(
  client: EACCClient, 
  jobId: ethers.BigNumberish, 
  job: any
) {
  console.log('\nSimulating work process...');

  try {
    console.log('Sending message to job creator...');
    const messageContent = {
      type: 'work_started',
      message: 'Hi! I\'ve started working on your project. I\'ll keep you updated on progress.',
      estimatedCompletion: '2024-01-15'
    };

    const messageHash = ethers.encodeBytes32String('QmMessageHash123');
    
    await client.postMessage(jobId, messageHash, job.roles.creator);
    console.log('Message sent to job creator');

    console.log('\n📦 Simulating work completion...');
    
    const deliveryContent = {
      type: 'project_delivery',
      githubRepo: 'https://github.com/worker/react-project',
      deployedUrl: 'https://react-project.vercel.app',
      documentation: 'https://github.com/worker/react-project/blob/main/README.md',
      notes: 'Project completed according to specifications. All requirements implemented.',
      completedDate: new Date().toISOString()
    };

    const deliveryHash = ethers.encodeBytes32String('QmDeliveryHash456');
    
    console.log('Delivering work result...');
    const deliveryTx = await client.deliverResult(jobId, deliveryHash);
    await deliveryTx.wait();
    console.log('Work delivered successfully!');

    console.log('\nDelivery details:', {
      jobId: jobId.toString(),
      deliveryHash: deliveryHash,
      timestamp: new Date().toLocaleString()
    });

    console.log('\nNext steps:');
    console.log('- Job creator will review your work');
    console.log('- If approved, payment will be released from escrow');
    console.log('- You may receive a rating and review');
    console.log('- If disputed, arbitrator will resolve');

    client.onJobCompleted((completedJobId) => {
      if (completedJobId == jobId) {
        console.log('Job completed and payment released');
      }
    });

    client.onJobDisputed((disputedJobId, disputer) => {
      if (disputedJobId == jobId) {
        console.log(`Job disputed by: ${disputer}`);
      }
    });

  } catch (error) {
    console.error('Error during work simulation:', error);
  }
}

async function refundJobExample(client: EACCClient, jobId: ethers.BigNumberish) {
  console.log('\nExample: Worker refunding job...');
  
  try {
    const tx = await client.refund(jobId);
    await tx.wait();
    console.log('Job refunded successfully');
    console.log('Job status changed back to Open, worker removed from whitelist');
    
  } catch (error) {
    console.error('Failed to refund job:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}