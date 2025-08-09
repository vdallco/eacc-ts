import { ethers } from 'ethers';

export interface IPFSConfig {
  gateway?: string;
  apiEndpoint?: string;
  timeout?: number;
}

export interface PinataConfig {
  apiKey: string;
  secretApiKey: string;
}

export interface IPFSUploadResult {
  hash: string;
  size: number;
  timestamp: number;
}

export class IPFSUtils {
  private config: IPFSConfig;

  constructor(config: IPFSConfig = {}) {
    this.config = {
      gateway: config.gateway || 'https://ipfs.io/ipfs/',
      apiEndpoint: config.apiEndpoint || 'https://api.pinata.cloud',
      timeout: config.timeout || 30000 // 30 seconds
    };
  }

  /**
   * Upload content to IPFS using Pinata service
   */
  async uploadToIPFS(
    content: string | object, 
    apiKey?: string, 
    secretKey?: string
  ): Promise<string> {
    if (!apiKey) {
      throw new Error('IPFS API key required for uploads. Please provide Pinata API credentials.');
    }

    const data = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    
    try {
      const response = await fetch(`${this.config.apiEndpoint}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': secretKey || ''
        },
        body: JSON.stringify({
          pinataContent: typeof content === 'string' ? { content: data } : content,
          pinataMetadata: {
            name: `eacc-content-${Date.now()}`,
            keyvalues: {
              timestamp: Date.now().toString(),
              source: 'eacc-sdk'
            }
          },
          pinataOptions: {
            cidVersion: 1
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
      }

      const result:any = await response.json();
      return result.IpfsHash;

    } catch (error: any) {
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  /**
   * Upload file to IPFS using Pinata service
   */
  async uploadFileToIPFS(
    file: File | Buffer, 
    filename: string,
    apiKey: string, 
    secretKey?: string
  ): Promise<string> {
    try {
      const formData = new FormData();
      
      if (file instanceof File) {
        formData.append('file', file);
      } else {
        // Convert Buffer to Blob for FormData
        const blob = new Blob([file]);
        formData.append('file', blob, filename);
      }

      const metadata = JSON.stringify({
        name: filename,
        keyvalues: {
          timestamp: Date.now().toString(),
          source: 'eacc-sdk'
        }
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 1
      });
      formData.append('pinataOptions', options);

      const response = await fetch(`${this.config.apiEndpoint}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': secretKey || ''
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata file upload error: ${response.status} - ${errorText}`);
      }

      const result:any = await response.json();
      return result.IpfsHash;

    } catch (error: any) {
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }

  /**
   * Fetch content from IPFS
   */
  async fetchFromIPFS(hash: string): Promise<string> {
    // Remove any prefixes and clean the hash
    const cleanHash = hash.replace(/^(ipfs:\/\/|\/ipfs\/|ipfs\/)/, '');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.gateway}${cleanHash}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, text/plain, */*'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`IPFS fetch error: ${response.status} - ${response.statusText}`);
      }

      return await response.text();

    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`IPFS fetch timeout after ${this.config.timeout}ms`);
      }
      throw new Error(`Failed to fetch from IPFS: ${error.message}`);
    }
  }

  /**
   * Fetch and parse JSON content from IPFS
   */
  async fetchJSONFromIPFS(hash: string): Promise<any> {
    try {
      const content = await this.fetchFromIPFS(hash);
      return JSON.parse(content);
    } catch (error: any) {
      throw new Error(`Failed to fetch JSON from IPFS: ${error.message}`);
    }
  }

  /**
   * Pin existing content to your Pinata account
   */
  async pinByHash(hash: string, apiKey: string, secretKey?: string, name?: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/pinning/pinByHash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': secretKey || ''
        },
        body: JSON.stringify({
          hashToPin: hash,
          pinataMetadata: {
            name: name || `eacc-pin-${Date.now()}`,
            keyvalues: {
              timestamp: Date.now().toString(),
              source: 'eacc-sdk-pin'
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata pin error: ${response.status} - ${errorText}`);
      }

    } catch (error: any) {
      throw new Error(`Failed to pin hash: ${error.message}`);
    }
  }

  /**
   * Get pinned files from Pinata
   */
  async getPinnedFiles(apiKey: string, secretKey?: string, limit = 10): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.config.apiEndpoint}/data/pinList?status=pinned&pageLimit=${limit}`,
        {
          headers: {
            'pinata_api_key': apiKey,
            'pinata_secret_api_key': secretKey || ''
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata list error: ${response.status} - ${errorText}`);
      }

      const result:any = await response.json();
      return result.rows || [];

    } catch (error: any) {
      throw new Error(`Failed to get pinned files: ${error.message}`);
    }
  }

  /**
   * Convert IPFS hash to bytes32 for efficient on-chain storage
   */
  hashToBytes32(hash: string): string {
    // For QmHash format (most common)
    if (hash.startsWith('Qm') && hash.length === 46) {
      // Remove Qm prefix and convert from base58 to hex
      // This is a simplified conversion - in production you'd use a proper base58 library
      try {
        const hashBuffer = this.base58ToBuffer(hash);
        // Take last 32 bytes (remove multihash prefix)
        const bytes32 = hashBuffer.slice(-32);
        return '0x' + bytes32.toString('hex');
      } catch {
        // Fallback to using the hash as-is
        return ethers.encodeBytes32String(hash.slice(0, 31));
      }
    }
    
    // For other formats, truncate and use as bytes32
    return ethers.encodeBytes32String(hash.slice(0, 31));
  }

  /**
   * Convert bytes32 back to IPFS hash
   */
  bytes32ToHash(bytes32: string): string {
    try {
      // Try to parse as bytes32 string first
      const parsed = ethers.decodeBytes32String(bytes32);
      if (parsed && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // If parsing fails, assume it's a converted hash
    }

    // If it looks like converted hash data, try to reconstruct
    if (bytes32.startsWith('0x') && bytes32.length === 66) {
      try {
        // This is a simplified reconstruction - in production you'd use proper base58 encoding
        const hexData = bytes32.slice(2);
        // Add back the multihash prefix for SHA-256 (0x1220)
        const fullHash = '1220' + hexData;
        return this.bufferToBase58(Buffer.from(fullHash, 'hex'));
      } catch {
        // Fallback to returning as-is
        return bytes32;
      }
    }

    return bytes32;
  }

  /**
   * Create IPFS URL from hash
   */
  createIPFSUrl(hash: string, gateway?: string): string {
    const cleanHash = hash.replace(/^(ipfs:\/\/|\/ipfs\/|ipfs\/)/, '');
    const usedGateway = gateway || this.config.gateway;
    return `${usedGateway}${cleanHash}`;
  }

  /**
   * Validate IPFS hash format
   */
  isValidIPFSHash(hash: string): boolean {
    // Basic validation for common IPFS hash formats
    if (typeof hash !== 'string') return false;
    
    // QmHash format (CIDv0)
    if (/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash)) return true;
    
    // CIDv1 format
    if (/^[a-z2-7]{59}$/.test(hash)) return true;
    
    // Base32 CIDv1
    if (/^b[a-z2-7]{58}$/.test(hash)) return true;
    
    return false;
  }

  /**
   * Get IPFS gateway status
   */
  async testGateway(gateway?: string): Promise<boolean> {
    const testGateway = gateway || this.config.gateway;
    const testHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'; // "hello world" hash
    
    try {
      const response = await fetch(`${testGateway}${testHash}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Simple base58 to buffer conversion (for demo purposes)
   * In production, use a proper base58 library like 'bs58'
   */
  private base58ToBuffer(str: string): Buffer {
    // This is a simplified implementation
    // For production use, install and use the 'bs58' package
    throw new Error('Base58 conversion requires additional library. Please use hash as-is or install bs58 package.');
  }

  /**
   * Simple buffer to base58 conversion (for demo purposes)
   */
  private bufferToBase58(buffer: Buffer): string {
    // This is a simplified implementation
    // For production use, install and use the 'bs58' package
    throw new Error('Base58 conversion requires additional library. Please use hash as-is or install bs58 package.');
  }

  // Static utility methods
  static createConfig(gateway?: string, apiEndpoint?: string): IPFSConfig {
    return {
      gateway: gateway || 'https://ipfs.io/ipfs/',
      apiEndpoint: apiEndpoint || 'https://api.pinata.cloud',
      timeout: 30000
    };
  }

  static getPopularGateways(): string[] {
    return [
      'https://ipfs.io/ipfs/',
      'https://gateway.pinata.cloud/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://dweb.link/ipfs/',
      'https://nftstorage.link/ipfs/'
    ];
  }
}