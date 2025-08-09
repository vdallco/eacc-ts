import { ethers } from 'ethers';

export interface TypedDataDomain {
  name?: string;
  version?: string;
  chainId?: number;
  verifyingContract?: string;
  salt?: string;
}

export interface TypedDataField {
  name: string;
  type: string;
}

export interface SignatureComponents {
  r: string;
  s: string;
  v: number;
}

export class CryptoUtils {
  /**
   * Hash a string using Keccak256
   */
  static keccak256(data: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }

  /**
   * Hash data using Solidity's keccak256 with proper type encoding
   */
  static solidityPackedKeccak256(types: string[], values: any[]): string {
    return ethers.solidityPackedKeccak256(types, values);
  }

  /**
   * Convert string to bytes32 format
   */
  static encodeBytes32String(text: string): string {
    return ethers.encodeBytes32String(text);
  }

  /**
   * Convert bytes32 back to string
   */
  static decodeBytes32String(bytes32: string): string {
    return ethers.decodeBytes32String(bytes32);
  }

  /**
   * Sign a message with a signer
   */
  static async signMessage(signer: ethers.Signer, message: string): Promise<string> {
    try {
      return await signer.signMessage(message);
    } catch (error: any) {
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  /**
   * Sign typed data (EIP-712)
   */
  static async signTypedData(
    signer: ethers.Signer,
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, any>
  ): Promise<string> {
    try {
      return await signer.signTypedData(domain, types, value);
    } catch (error: any) {
      throw new Error(`Failed to sign typed data: ${error.message}`);
    }
  }

  /**
   * Verify a message signature
   */
  static verifyMessage(message: string, signature: string): string {
    try {
      return ethers.verifyMessage(message, signature);
    } catch (error: any) {
      throw new Error(`Failed to verify message: ${error.message}`);
    }
  }

  /**
   * Verify typed data signature
   */
  static verifyTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, any>,
    signature: string
  ): string {
    try {
      return ethers.verifyTypedData(domain, types, value, signature);
    } catch (error: any) {
      throw new Error(`Failed to verify typed data: ${error.message}`);
    }
  }

  /**
   * Create a job signature hash for takeJob function
   */
  static createJobSignatureHash(eventsLength: number, jobId: ethers.BigNumberish): string {
    return ethers.solidityPackedKeccak256(
      ['uint256', 'uint256'],
      [eventsLength, jobId]
    );
  }

  /**
   * Create the full job signature message for takeJob
   */
  static createJobSignatureMessage(eventsLength: number, jobId: ethers.BigNumberish): string {
    const hash = this.createJobSignatureHash(eventsLength, jobId);
    return ethers.hashMessage(ethers.toBeArray(hash));
  }

  /**
   * Sign a job taking transaction
   */
  static async signJobTaking(
    signer: ethers.Signer,
    eventsLength: number,
    jobId: ethers.BigNumberish
  ): Promise<string> {
    const hash = this.createJobSignatureHash(eventsLength, jobId);
    return await this.signMessage(signer, ethers.toBeArray(hash) as any);
  }

  /**
   * Split signature into components
   */
  static splitSignature(signature: string): SignatureComponents {
    try {
      const signatureDeserialized = ethers.Signature.from(signature);

      return {
        r: signatureDeserialized.r,
        s: signatureDeserialized.s,
        v: signatureDeserialized.v
      };
    } catch (error: any) {
      throw new Error(`Failed to split signature: ${error.message}`);
    }
  }

  /**
   * Join signature components
   */
  static joinSignature(signature: SignatureComponents): string {
    try {
      return ethers.Signature.from({
        r: signature.r,
        s: signature.s,
        v: signature.v
      }).serialized;
    } catch (error: any) {
      throw new Error(`Failed to join signature: ${error.message}`);
    }
  }

  /**
   * Generate a random 32-byte value
   */
  static randomBytes32(): string {
    return ethers.hexlify(ethers.randomBytes(32));
  }

  /**
   * Generate random bytes of specified length
   */
  static randomBytes(length: number): string {
    return ethers.hexlify(ethers.randomBytes(length));
  }

  /**
   * Compute address from public key
   */
  static computeAddress(publicKey: string): string {
    try {
      return ethers.computeAddress(publicKey);
    } catch (error: any) {
      throw new Error(`Failed to compute address: ${error.message}`);
    }
  }

  /**
   * Recover address from message and signature
   */
  static recoverAddress(message: string, signature: string): string {
    try {
      return ethers.verifyMessage(message, signature);
    } catch (error: any) {
      throw new Error(`Failed to recover address: ${error.message}`);
    }
  }

  /**
   * Encode function call data
   */
  static encodeFunctionData(
    functionFragment: string,
    values: any[]
  ): string {
    try {
      const iface = new ethers.Interface([functionFragment]);
      const functionName = functionFragment.split('(')[0].split(' ').pop();
      return iface.encodeFunctionData(functionName!, values);
    } catch (error: any) {
      throw new Error(`Failed to encode function data: ${error.message}`);
    }
  }

  /**
   * Decode function call data
   */
  static decodeFunctionData(
    functionFragment: string,
    data: string
  ): ethers.Result {
    try {
      const iface = new ethers.Interface([functionFragment]);
      const functionName = functionFragment.split('(')[0].split(' ').pop();
      return iface.decodeFunctionData(functionName!, data);
    } catch (error: any) {
      throw new Error(`Failed to decode function data: ${error.message}`);
    }
  }

  /**
   * ABI encode parameters
   */
  static abiEncode(types: string[], values: any[]): string {
    try {
      return ethers.AbiCoder.defaultAbiCoder().encode(types, values);
    } catch (error: any) {
      throw new Error(`Failed to encode ABI: ${error.message}`);
    }
  }

  /**
   * ABI decode parameters
   */
  static abiDecode(types: string[], data: string): ethers.Result {
    try {
      return ethers.AbiCoder.defaultAbiCoder().decode(types, data);
    } catch (error: any) {
      throw new Error(`Failed to decode ABI: ${error.message}`);
    }
  }

  /**
   * Create EIP-712 domain separator
   */
  static createDomainSeparator(domain: TypedDataDomain): string {
    try {
      return ethers.TypedDataEncoder.hashDomain(domain);
    } catch (error: any) {
      throw new Error(`Failed to create domain separator: ${error.message}`);
    }
  }

  /**
   * Hash typed data according to EIP-712
   */
  static hashTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, any>
  ): string {
    try {
      return ethers.TypedDataEncoder.hash(domain, types, value);
    } catch (error: any) {
      throw new Error(`Failed to hash typed data: ${error.message}`);
    }
  }

  /**
   * Create a permit signature for ERC20 tokens
   */
  static async createPermitSignature(
    signer: ethers.Signer,
    tokenAddress: string,
    spender: string,
    value: ethers.BigNumberish,
    deadline: number,
    nonce: number,
    chainId: number
  ): Promise<string> {
    const domain = {
      name: 'ERC20Token', // This should be the actual token name
      version: '1',
      chainId,
      verifyingContract: tokenAddress
    };

    const types = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    };

    const values = {
      owner: await signer.getAddress(),
      spender,
      value,
      nonce,
      deadline
    };

    return await this.signTypedData(signer, domain, types, values);
  }

  /**
   * Validate Ethereum address format
   */
  static isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Get checksum address
   */
  static getChecksumAddress(address: string): string {
    try {
      return ethers.getAddress(address);
    } catch (error: any) {
      throw new Error(`Invalid address: ${error.message}`);
    }
  }

  /**
   * Generate entropy for wallet creation
   */
  static generateEntropy(length: number = 32): string {
    return ethers.hexlify(ethers.randomBytes(length));
  }

  /**
   * Create HD wallet from mnemonic
   */
  static fromMnemonic(mnemonic: string, path?: string) {
    try {
      return ethers.Wallet.fromPhrase(mnemonic);
    } catch (error: any) {
      throw new Error(`Failed to create wallet from mnemonic: ${error.message}`);
    }
  }

  /**
   * Generate random mnemonic
   */
  static generateMnemonic(): string {
    try {
      const entropy = this.generateEntropy(16); // 128 bits for 12 words
      return ethers.Mnemonic.entropyToPhrase(entropy);
    } catch (error: any) {
      throw new Error(`Failed to generate mnemonic: ${error.message}`);
    }
  }

  /**
   * Validate mnemonic phrase
   */
  static isValidMnemonic(mnemonic: string): boolean {
    try {
      return ethers.Mnemonic.isValidMnemonic(mnemonic);
    } catch {
      return false;
    }
  }

  /**
   * Hash a password with salt (for client-side key derivation)
   */
  static hashPassword(password: string, salt: string): string {
    const combined = password + salt;
    return this.keccak256(combined);
  }

  /**
   * Create deterministic salt from address
   */
  static createSalt(address: string, nonce: number = 0): string {
    return this.solidityPackedKeccak256(['address', 'uint256'], [address, nonce]);
  }

  /**
   * Encrypt data using a shared secret (simplified)
   * Note: This is a basic implementation. For production, use proper encryption libraries
   */
  static simpleEncrypt(data: string, key: string): string {
    // This is a placeholder - implement proper encryption using crypto libraries
    const keyHash = this.keccak256(key);
    const dataBytes = ethers.toUtf8Bytes(data);
    const keyBytes = ethers.toBeArray(keyHash);
    
    // Simple XOR encryption (NOT secure for production!)
    const encrypted = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return ethers.hexlify(encrypted);
  }

  /**
   * Decrypt data using a shared secret (simplified)
   */
  static simpleDecrypt(encryptedData: string, key: string): string {
    // This is a placeholder - implement proper decryption using crypto libraries
    const keyHash = this.keccak256(key);
    const dataBytes = ethers.toBeArray(encryptedData);
    const keyBytes = ethers.toBeArray(keyHash);
    
    // Simple XOR decryption (NOT secure for production!)
    const decrypted = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      decrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return ethers.toUtf8String(decrypted);
  }

  /**
   * Create a commitment hash (for commit-reveal schemes)
   */
  static createCommitment(value: string, nonce: string): string {
    return this.solidityPackedKeccak256(['string', 'string'], [value, nonce]);
  }

  /**
   * Verify a commitment
   */
  static verifyCommitment(commitment: string, value: string, nonce: string): boolean {
    const computedCommitment = this.createCommitment(value, nonce);
    return commitment === computedCommitment;
  }

  /**
   * Create a Merkle tree leaf hash
   */
  static createMerkleLeaf(data: string): string {
    return this.keccak256(data);
  }

  /**
   * Create a Merkle tree node hash
   */
  static createMerkleNode(left: string, right: string): string {
    // Sort to prevent second preimage attacks
    const [first, second] = [left, right].sort();
    return this.solidityPackedKeccak256(['bytes32', 'bytes32'], [first, second]);
  }

  /**
   * Format units (like formatEther but for any decimals)
   */
  static formatUnits(value: ethers.BigNumberish, decimals: number = 18): string {
    return ethers.formatUnits(value, decimals);
  }

  /**
   * Parse units (like parseEther but for any decimals)
   */
  static parseUnits(value: string, decimals: number = 18): ethers.BigNumberish {
    return ethers.parseUnits(value, decimals);
  }

  /**
   * Get current timestamp
   */
  static getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Add time to current timestamp
   */
  static addTime(seconds: number): number {
    return this.getCurrentTimestamp() + seconds;
  }

  /**
   * Validate signature format
   */
  static isValidSignature(signature: string): boolean {
    try {
      if (!signature.startsWith('0x') || signature.length !== 132) {
        return false;
      }
      this.splitSignature(signature);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a typed data signature for EACC marketplace
   */
  static async createEACCJobSignature(
    signer: ethers.Signer,
    jobId: ethers.BigNumberish,
    eventsLength: number,
    contractAddress: string,
    chainId: number
  ): Promise<string> {
    const domain = {
      name: 'EACC Marketplace',
      version: '2',
      chainId,
      verifyingContract: contractAddress
    };

    const types = {
      JobTaking: [
        { name: 'jobId', type: 'uint256' },
        { name: 'eventsLength', type: 'uint256' }
      ]
    };

    const values = {
      jobId,
      eventsLength
    };

    return await this.signTypedData(signer, domain, types, values);
  }

  // Static utility methods
  static readonly ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
  static readonly ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  
  /**
   * Common time constants
   */
  static readonly TIME = {
    SECOND: 1,
    MINUTE: 60,
    HOUR: 3600,
    DAY: 86400,
    WEEK: 604800,
    MONTH: 2592000,
    YEAR: 31536000
  };

  /**
   * Common gas limits
   */
  static readonly GAS_LIMITS = {
    SIMPLE_TRANSFER: 21000,
    ERC20_TRANSFER: 65000,
    CONTRACT_CALL: 100000,
    CONTRACT_DEPLOYMENT: 2000000
  };
}