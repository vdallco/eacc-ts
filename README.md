# EACC SDK

TypeScript SDK for interacting with Effective Acceleration, a decentralized peer-to-peer marketplace for jobs and services.

## Features

- **Multi-wallet support** - MetaMask, WalletConnect, and private key connections
- **Complete job lifecycle** - Create, update, take, deliver, and complete jobs
- **User management** - Register users and arbitrators with profiles
- **Messaging system** - Encrypted communication between parties
- **Dispute resolution** - Built-in arbitration system
- **Type-safe** - Full TypeScript support with proper types
- **IPFS integration** - Decentralized content storage

## Installation

```bash
npm install eacc-ts ethers
```

## Quick Start

```typescript
import { EACCClient } from 'eacc-ts';
import { ethers } from 'ethers';

// Initialize the client
const client = new EACCClient({
  marketplaceV2Address: '0x...',
  marketplaceDataV1Address: '0x...',
  chainId: 1, // Ethereum mainnet
});

// Connect wallet
await client.connectMetaMask();

// Register as a user
await client.registerUser({
  pubkey: '0x...',
  name: 'John Doe',
  bio: 'Full-stack developer',
  avatar: 'https://example.com/avatar.jpg'
});

// Publish a job
const jobId = await client.publishJob({
  title: 'Build a React App',
  contentHash: 'Qm...', // IPFS hash with job details
  multipleApplicants: true,
  tags: ['DA', 'react', 'javascript'],
  token: '0x...', // ERC20 token address
  amount: ethers.utils.parseEther('1'),
  maxTime: 86400 * 7, // 7 days in seconds
  deliveryMethod: 'IPFS'
});

console.log('Job published with ID:', jobId.toString());
```

## Core Concepts

### Job States
- **Open** (0): Job is available for workers to apply
- **Taken** (1): Worker has been assigned and escrow is active
- **Closed** (2): Job completed or cancelled

### MECE Tags
Every job must include exactly one MECE (Mutually Exclusive, Collectively Exhaustive) tag:
- **DA**: Digital Audio
- **DV**: Digital Video  
- **DT**: Digital Text
- **DS**: Digital Software
- **DO**: Digital Others
- **NDG**: Non-Digital Goods
- **NDS**: Non-Digital Services
- **NDO**: Non-Digital Others

## API Reference

### Client Initialization

```typescript
const client = new EACCClient({
  marketplaceV2Address: string,
  marketplaceDataV1Address: string,
  chainId?: number,
  ipfsConfig?: {
    gateway?: string,
    apiEndpoint?: string
  }
});
```

### Wallet Connection

```typescript
// MetaMask
await client.connectMetaMask();

// Private key
await client.connectWithPrivateKey(privateKey, rpcUrl);

// Custom provider
await client.connectProvider(provider);
```

### User Management

```typescript
// Register user
await client.registerUser({
  pubkey: string,
  name: string,
  bio: string,
  avatar: string
});

// Update profile
await client.updateUser({
  name: string,
  bio: string,
  avatar: string
});

// Get user info
const user = await client.getUser(address);
const rating = await client.getUserRating(address);
const reviews = await client.getUserReviews(address, 0, 10);
```

### Job Management

```typescript
// Publish job
const jobId = await client.publishJob({
  title: string,
  contentHash: string,
  multipleApplicants: boolean,
  tags: string[],
  token: string,
  amount: BigNumber,
  maxTime: number,
  deliveryMethod: string,
  arbitrator?: string,
  allowedWorkers?: string[]
});

// Take job
await client.takeJob(jobId, signature);

// Deliver result
await client.deliverResult(jobId, resultHash);

// Approve and complete
await client.approveResult(jobId, rating, review);
```

### IPFS Integration

```typescript
// Upload content to IPFS
const hash = await client.uploadToIPFS(content, apiKey);

// Fetch content from IPFS
const content = await client.fetchFromIPFS(hash);
```

## Examples

Check out the `/examples` directory for complete usage examples:

- `basic-usage.ts` - Basic SDK setup and connection
- `publish-job.ts` - Creating and publishing a job
- `take-job.ts` - Worker taking and completing a job
- `register-user.ts` - User and arbitrator registration

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run examples
npm run example:basic
npm run example:publish
npm run example:take
npm run example:register

# Run tests
npm test
```

## Network Addresses

### Mainnet
- MarketplaceV2: 0x405AcFbD1400A168fDd4aDA2D214e8Ae5FF7a624
- MarketplaceDataV1: 0x0191ae69d05F11C7978cCCa2DE15653BaB509d9a

### Testnet (Goerli)
- MarketplaceV2: TBD
- MarketplaceDataV1: TBD

## Error Handling

The SDK includes comprehensive error handling:

```typescript
try {
  await client.takeJob(jobId, signature);
} catch (error) {
  if (error.message.includes('not registered')) {
    console.log('User not registered, please register first');
  } else if (error.message.includes('not whitelisted')) {
    console.log('Worker not whitelisted for this job');
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feat/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [Documentation](https://docs.effectiveacceleration.ai)
- [Website](https://effectiveacceleration.ai)
- [Telegram](https://t.me/+5h3d8x_NgnYyYjhh)