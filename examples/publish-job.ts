import { EACCClient, getNetworkAddresses, MECE_TAGS } from '../src';
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
      '0x' + '0'.repeat(64),
      'https://goerli.infura.io/v3/YOUR_INFURA_KEY'
    );

    const address = await client.getAddress();
    console.log(`Connected as: ${address}\n`);

    const isRegistered = await client.isUserRegistered(address);
    if (!isRegistered) {
      console.log('User not registered. Please register first.');
      return;
    }

    // Upload description to IPFS (in production, you need a real IPFS service API key or endpoint)
    // Fallback to using the effectiveacceleration.ai IPFS gateway for demo purposes
    let contentHash: string;
    try {
      // contentHash = await client.uploadToIPFS(jobContent, 'YOUR_PINATA_API_KEY');
      // For demo purposes, we'll use a mock hash
      contentHash = 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o';
      console.log(`Content uploaded to IPFS: ${contentHash}\n`);
    } catch (error) {
      console.log('⚠️ IPFS upload failed (using mock hash for demo)');
      contentHash = 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o';
    }

    // Step 2: Prepare job parameters
    console.log('⚙️ Preparing job parameters...');
    const jobParams = {
      title: 'React TypeScript Developer - Modern Web App',
      contentHash: ethers.encodeBytes32String(contentHash.slice(0, 31)), // Convert to bytes32
      multipleApplicants: true, // Allow multiple workers to apply
      tags: ['DS', 'react', 'typescript', 'frontend', 'web-development'], // DS = Digital Software (MECE tag)
      token: '0xA0b86a33E6441e90E9b4d1deF7C8DFE7dAE0B25D', // Example ERC20 token (replace with actual)
      amount: ethers.parseEther('2'), // 2 ETH
      maxTime: 86400 * 14, // 14 days in seconds
      deliveryMethod: 'GitHub + Deployed URL',
      arbitrator: '0x0000000000000000000000000000000000000000', // No arbitrator for this example
      allowedWorkers: [] // Open to all workers
    };

    console.log('Job parameters:', {
      title: jobParams.title,
      amount: ethers.formatEther(jobParams.amount) + ' ETH',
      maxTime: jobParams.maxTime / 86400 + ' days',
      tags: jobParams.tags,
      multipleApplicants: jobParams.multipleApplicants
    });
    
    try {
      const tx = await client.publishJob(jobParams);
      console.log(`Transaction sent: ${tx}`);
      
      console.log('Waiting for confirmation...');
      const receipt = await tx.wait();
      console.log(`Job published. Transaction confirmed in block ${receipt.blockNumber}`);

      const jobCreatedEvent = receipt.events?.find(e => e.event === 'JobCreated');
      if (jobCreatedEvent) {
        const jobId = jobCreatedEvent.args?.jobId;
        console.log(`Job ID: ${jobId.toString()}\n`);

        console.log('Verifying job creation...');
        const job = await client.getJob(jobId);
        console.log('Job details:', {
          id: jobId.toString(),
          title: job.title,
          state: job.state, // Should be 0 (Open)
          creator: job.roles.creator,
          amount: ethers.formatEther(job.amount),
          timestamp: new Date(job.timestamp * 1000).toLocaleString(),
          tags: job.tags
        });

        console.log('\nSetting up event listeners...');
        
        client.onJobTaken((jobId, worker) => {
          console.log(`Job ${jobId.toString()} taken by worker: ${worker}`);
        });

        client.onJobCompleted((jobId) => {
          console.log(`Job ${jobId.toString()} completed!`);
        });

        client.onJobDisputed((jobId, disputer) => {
          console.log(`Job ${jobId.toString()} disputed by: ${disputer}`);
        });

        console.log('Event listeners active. Job is now live and workers can apply!');
        console.log('\nNext steps:');
        console.log('- Workers can now view and apply for your job');
        console.log('- You can update job details if needed');
        console.log('- Monitor applications and messages');
        console.log('- Select a worker when ready (if multipleApplicants is true)');

      }

    } catch (error) {
      console.error('Failed to publish job:', error);
      
      if (error.message.includes('not registered')) {
        console.log('Solution: Register as a user first');
      } else if (error.message.includes('invalid token')) {
        console.log('Solution: Use a valid ERC20 token address');
      } else if (error.message.includes('title too short')) {
        console.log('Solution: Job title must be between 1-254 characters');
      } else if (error.message.includes('MECE tag')) {
        console.log('Solution: Include exactly one MECE tag:', Object.keys(MECE_TAGS));
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

async function updateJobExample(client: EACCClient, jobId: ethers.BigNumberish) {
  console.log('\n📝 Example: Updating job...');
  
  try {
    const updateParams = {
      jobId,
      title: 'React TypeScript Developer - Modern Web App (UPDATED)',
      contentHash: ethers.encodeBytes32String('QmUpdatedContentHash'),
      tags: ['DS', 'react', 'typescript', 'frontend', 'urgent'],
      amount: ethers.parseEther('2.5'), // Increased amount
      maxTime: 86400 * 10, // Reduced to 10 days
      arbitrator: '0x0000000000000000000000000000000000000000',
      whitelistWorkers: false
    };

    const tx = await client.updateJob(updateParams);
    await tx.wait();
    console.log('Job updated successfully!');
    
  } catch (error) {
    console.error('Failed to update job:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}