import { EACCClient, getNetworkAddresses } from '../src';
import { ethers } from 'ethers';
import { ARBITRUM_ONE_MAINNET } from '../src/constants/chains';

async function main() {
  const chainId = ARBITRUM_ONE_MAINNET;
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
    console.log(`Connected address: ${address}\n`);

    console.log('Checking registration status...');
    const isAlreadyRegistered = await client.isUserRegistered(address);
    
    if (isAlreadyRegistered) {
      console.log('User already registered!');
      const existingUser = await client.getUser(address);
      console.log('Current profile:', {
        name: existingUser.name,
        bio: existingUser.bio,
        avatar: existingUser.avatar,
        reputationUp: existingUser.reputationUp,
        reputationDown: existingUser.reputationDown
      });

      await updateUserProfileExample(client);
      return;
    }

    console.log('Generating public key for messaging...');
    
    const wallet = ethers.Wallet.createRandom();
    const mockPubkey = '0x02' + wallet.publicKey.slice(4, 68);
    console.log(`Public key: ${mockPubkey}`);

    console.log('\nPreparing registration data...');
    const userData = {
      pubkey: mockPubkey,
      name: 'Alice Developer',
      bio: 'Full-stack developer with 5+ years experience in React, Node.js, and blockchain development. Passionate about creating efficient, scalable solutions.',
      avatar: 'https://avatars.githubusercontent.com/u/12345?v=4'
    };

    console.log('Registration data:', {
      name: userData.name,
      bio: userData.bio.slice(0, 100) + '...',
      avatar: userData.avatar,
      pubkeyLength: userData.pubkey.length
    });

    console.log('\nRegistering user...');
    try {
      const tx = await client.registerUser(userData);
      console.log(`Transaction sent: ${tx.hash}`);
      
      console.log('Waiting for confirmation...');
      const receipt = await tx.wait();
      console.log(`User registered. Transaction confirmed in block ${receipt.blockNumber}`);

      console.log('\nVerifying registration...');
      const isRegistered = await client.isUserRegistered(address);
      console.log(`Registration successful: ${isRegistered}`);

      if (isRegistered) {
        const user = await client.getUser(address);
        console.log('\nUser profile created:', {
          address: user.address_,
          name: user.name,
          bio: user.bio,
          avatar: user.avatar,
          reputationUp: user.reputationUp,
          reputationDown: user.reputationDown
        });

        const rating = await client.getUserRating(address);
        console.log('\nInitial rating:', {
          averageRating: rating.averageRating,
          numberOfReviews: rating.numberOfReviews.toString()
        });

        console.log('\nRegistration complete. You can now:');
        console.log('- Create and publish jobs');
        console.log('- Apply for jobs as a worker');
        console.log('- Send encrypted messages to other users');
        console.log('- Build your reputation through completed work');
      }

    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error.message.includes('already registered')) {
        console.log('User already registered with this address');
      } else if (error.message.includes('invalid pubkey length')) {
        console.log('Public key must be compressed (33 bytes)');
      } else if (error.message.includes('name too short')) {
        console.log('Name must be 1-19 characters');
      } else if (error.message.includes('bio too long')) {
        console.log('Bio must be less than 255 characters');
      }
    }

    console.log('\nExample: Arbitrator registration...');
    await registerArbitratorExample(client);

  } catch (error) {
    console.error('Error:', error);
  }
}

async function updateUserProfileExample(client: EACCClient) {
  try {
    const updateData = {
      name: 'Alice Senior Dev',
      bio: 'Senior full-stack developer and blockchain specialist. Expert in React, Node.js, Solidity, and DeFi protocols. Available for complex projects.',
      avatar: 'https://new-avatar-url.com/alice.jpg'
    };

    console.log('Updating profile with:', updateData);

    const tx = await client.updateUser(updateData);
    console.log(`Update transaction: ${tx.hash}`);
    
    await tx.wait();
    console.log('Profile updated successfully!');

    const address = await client.getAddress();
    const updatedUser = await client.getUser(address);
    console.log('Updated profile:', {
      name: updatedUser.name,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar
    });

  } catch (error) {
    console.error('Profile update failed:', error);
  }
}

async function registerArbitratorExample(client: EACCClient) {
  try {
    const address = await client.getAddress();
    const isArbitratorRegistered = await client.isArbitratorRegistered(address);
    
    if (isArbitratorRegistered) {
      console.log('Already registered as arbitrator');
      const arbitrator = await client.getArbitrator(address);
      console.log('Arbitrator profile:', {
        name: arbitrator.name,
        fee: arbitrator.fee,
        settledCount: arbitrator.settledCount
      });
      return;
    }

    console.log('Registering as arbitrator...');
    
    const wallet = ethers.Wallet.createRandom();
    const arbitratorPubkey = '0x02' + wallet.publicKey.slice(4, 68);

    const arbitratorData = {
      pubkey: arbitratorPubkey,
      name: 'Alice Arbitrator',
      bio: 'Experienced blockchain arbitrator with background in law and technology. Fair, efficient dispute resolution.',
      avatar: 'https://arbitrator-avatar.com/alice.jpg',
      fee: 250 // 2.5% fee (in basis points)
    };

    const tx = await client.registerArbitrator(arbitratorData);
    console.log(`Arbitrator registration transaction: ${tx.hash}`);
    
    await tx.wait();
    console.log('Arbitrator registered successfully!');

    const isRegistered = await client.isArbitratorRegistered(address);
    if (isRegistered) {
      const arbitrator = await client.getArbitrator(address);
      console.log('👨‍⚖️ Arbitrator profile:', {
        name: arbitrator.name,
        fee: arbitrator.fee / 100 + '%',
        bio: arbitrator.bio
      });

      console.log('\nAs an arbitrator, you can now:');
      console.log('- Be selected for job dispute resolution');
      console.log('- Earn fees for settled disputes');
      console.log('- Build reputation through fair arbitration');
    }

  } catch (error) {
    console.error('Arbitrator registration failed:', error);
    
    if (error.message.includes('already registered')) {
      console.log('Already registered as arbitrator');
    }
  }
}

async function getUserReviewsExample(client: EACCClient, userAddress: string) {
  console.log(`\nGetting reviews for user: ${userAddress}`);
  
  try {
    const reviews = await client.getUserReviews(userAddress, 0, 10);
    
    if (reviews.length === 0) {
      console.log('No reviews yet');
      return;
    }

    console.log(`Found ${reviews.length} reviews:`);
    reviews.forEach((review, index) => {
      console.log(`Review ${index + 1}:`, {
        rating: review.rating,
        text: review.text,
        reviewer: review.reviewer,
        jobId: review.jobId.toString(),
        date: new Date(review.timestamp * 1000).toLocaleDateString()
      });
    });

    const rating = await client.getUserRating(userAddress);
    console.log('Overall rating:', {
      average: rating.averageRating / 10000,
      totalReviews: rating.numberOfReviews.toString()
    });

  } catch (error) {
    console.error('Failed to get reviews:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}