/**
 * Beam Blockchain Client
 * 
 * Core transport layer for interacting with the Beam blockchain.
 * Uses ethers.js v6 for EVM-compatible operations.
 */

import { ethers, JsonRpcProvider, Wallet, Contract, TransactionResponse, TransactionReceipt } from 'ethers';
import { NETWORKS, GAS_CONFIG, type NetworkConfig } from '../constants/networks';
import { CONTRACTS, ERC20_ABI, ERC721_ABI, ERC1155_ABI, WRAPPED_BEAM_ABI } from '../constants/contracts';

export interface BeamClientConfig {
	network: string;
	rpcUrl?: string;
	privateKey?: string;
	chainId?: number;
}

export interface TransactionOptions {
	gasLimit?: bigint;
	maxFeePerGas?: bigint;
	maxPriorityFeePerGas?: bigint;
	nonce?: number;
	value?: bigint;
}

export class BeamClient {
	private provider: JsonRpcProvider;
	private wallet: Wallet | null = null;
	private networkConfig: NetworkConfig;
	private contracts: typeof CONTRACTS.mainnet;

	constructor(config: BeamClientConfig) {
		// Get network configuration
		this.networkConfig = NETWORKS[config.network] || NETWORKS.mainnet;
		
		// Override RPC URL if provided
		const rpcUrl = config.rpcUrl || this.networkConfig.rpcUrl;
		
		// Initialize provider
		this.provider = new JsonRpcProvider(rpcUrl, {
			chainId: config.chainId || this.networkConfig.chainId,
			name: this.networkConfig.name,
		});
		
		// Initialize wallet if private key provided
		if (config.privateKey) {
			this.wallet = new Wallet(config.privateKey, this.provider);
		}
		
		// Get contract addresses for network
		this.contracts = CONTRACTS[config.network] || CONTRACTS.mainnet;
	}

	/**
	 * Get the provider instance
	 */
	getProvider(): JsonRpcProvider {
		return this.provider;
	}

	/**
	 * Get the wallet instance
	 */
	getWallet(): Wallet | null {
		return this.wallet;
	}

	/**
	 * Get the signer (wallet or provider)
	 */
	getSigner(): Wallet {
		if (!this.wallet) {
			throw new Error('No wallet configured. Private key required for signing.');
		}
		return this.wallet;
	}

	/**
	 * Get network configuration
	 */
	getNetworkConfig(): NetworkConfig {
		return this.networkConfig;
	}

	/**
	 * Get contract addresses
	 */
	getContracts(): typeof CONTRACTS.mainnet {
		return this.contracts;
	}

	// ============ Balance Operations ============

	/**
	 * Get the wallet address
	 */
	async getAddress(): Promise<string> {
		if (!this.wallet) {
			throw new Error('No wallet configured. Private key required.');
		}
		return this.wallet.address;
	}

	/**
	 * Get native BEAM balance
	 */
	async getBalance(address: string): Promise<bigint> {
		return this.provider.getBalance(address);
	}

	/**
	 * Get wrapped BEAM balance
	 */
	async getWrappedBeamBalance(address: string): Promise<bigint> {
		const wbeam = new Contract(this.contracts.wrappedBeam, ERC20_ABI, this.provider);
		return wbeam.balanceOf(address);
	}

	/**
	 * Get ERC20 token balance
	 */
	async getTokenBalance(tokenAddress: string, ownerAddress: string): Promise<bigint> {
		const token = new Contract(tokenAddress, ERC20_ABI, this.provider);
		return token.balanceOf(ownerAddress);
	}

	/**
	 * Get token info (name, symbol, decimals)
	 */
	async getTokenInfo(tokenAddress: string): Promise<{
		name: string;
		symbol: string;
		decimals: number;
		totalSupply: bigint;
	}> {
		const token = new Contract(tokenAddress, ERC20_ABI, this.provider);
		const [name, symbol, decimals, totalSupply] = await Promise.all([
			token.name(),
			token.symbol(),
			token.decimals(),
			token.totalSupply(),
		]);
		return { name, symbol, decimals: Number(decimals), totalSupply };
	}

	// ============ Transfer Operations ============

	/**
	 * Transfer native BEAM
	 */
	async transferBeam(
		to: string,
		amount: bigint,
		options?: TransactionOptions
	): Promise<TransactionResponse> {
		const signer = this.getSigner();
		
		const tx = await signer.sendTransaction({
			to,
			value: amount,
			gasLimit: options?.gasLimit || BigInt(GAS_CONFIG.defaultGasLimit),
			maxFeePerGas: options?.maxFeePerGas,
			maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
			nonce: options?.nonce,
		});
		
		return tx;
	}

	/**
	 * Transfer ERC20 tokens
	 */
	async transferToken(
		tokenAddress: string,
		to: string,
		amount: bigint,
		options?: TransactionOptions
	): Promise<TransactionResponse> {
		const signer = this.getSigner();
		const token = new Contract(tokenAddress, ERC20_ABI, signer);
		
		return token.transfer(to, amount, {
			gasLimit: options?.gasLimit || BigInt(GAS_CONFIG.erc20TransferGas),
			maxFeePerGas: options?.maxFeePerGas,
			maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
			nonce: options?.nonce,
		});
	}

	// ============ Wrap/Unwrap BEAM ============

	/**
	 * Wrap BEAM to WBEAM
	 */
	async wrapBeam(amount: bigint, options?: TransactionOptions): Promise<TransactionResponse> {
		const signer = this.getSigner();
		const wbeam = new Contract(this.contracts.wrappedBeam, WRAPPED_BEAM_ABI, signer);
		
		return wbeam.deposit({
			value: amount,
			gasLimit: options?.gasLimit || BigInt(60000),
			maxFeePerGas: options?.maxFeePerGas,
			maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
		});
	}

	/**
	 * Unwrap WBEAM to BEAM
	 */
	async unwrapBeam(amount: bigint, options?: TransactionOptions): Promise<TransactionResponse> {
		const signer = this.getSigner();
		const wbeam = new Contract(this.contracts.wrappedBeam, WRAPPED_BEAM_ABI, signer);
		
		return wbeam.withdraw(amount, {
			gasLimit: options?.gasLimit || BigInt(60000),
			maxFeePerGas: options?.maxFeePerGas,
			maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
		});
	}

	// ============ NFT Operations ============

	/**
	 * Get NFT owner
	 */
	async getNftOwner(contractAddress: string, tokenId: bigint): Promise<string> {
		const nft = new Contract(contractAddress, ERC721_ABI, this.provider);
		return nft.ownerOf(tokenId);
	}

	/**
	 * Get NFT token URI
	 */
	async getNftTokenUri(contractAddress: string, tokenId: bigint): Promise<string> {
		const nft = new Contract(contractAddress, ERC721_ABI, this.provider);
		return nft.tokenURI(tokenId);
	}

	/**
	 * Get NFT balance (count)
	 */
	async getNftBalance(contractAddress: string, ownerAddress: string): Promise<bigint> {
		const nft = new Contract(contractAddress, ERC721_ABI, this.provider);
		return nft.balanceOf(ownerAddress);
	}

	/**
	 * Transfer ERC721 NFT
	 */
	async transferNft(
		contractAddress: string,
		from: string,
		to: string,
		tokenId: bigint,
		options?: TransactionOptions
	): Promise<TransactionResponse> {
		const signer = this.getSigner();
		const nft = new Contract(contractAddress, ERC721_ABI, signer);
		
		return nft['safeTransferFrom(address,address,uint256)'](from, to, tokenId, {
			gasLimit: options?.gasLimit || BigInt(GAS_CONFIG.erc721TransferGas),
			maxFeePerGas: options?.maxFeePerGas,
			maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
		});
	}

	/**
	 * Get ERC1155 balance
	 */
	async getErc1155Balance(
		contractAddress: string,
		ownerAddress: string,
		tokenId: bigint
	): Promise<bigint> {
		const token = new Contract(contractAddress, ERC1155_ABI, this.provider);
		return token.balanceOf(ownerAddress, tokenId);
	}

	/**
	 * Transfer ERC1155 token
	 */
	async transferErc1155(
		contractAddress: string,
		from: string,
		to: string,
		tokenId: bigint,
		amount: bigint,
		data: string = '0x',
		options?: TransactionOptions
	): Promise<TransactionResponse> {
		const signer = this.getSigner();
		const token = new Contract(contractAddress, ERC1155_ABI, signer);
		
		return token.safeTransferFrom(from, to, tokenId, amount, data, {
			gasLimit: options?.gasLimit || BigInt(100000),
			maxFeePerGas: options?.maxFeePerGas,
			maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
		});
	}

	// ============ Block Operations ============

	/**
	 * Get current block number
	 */
	async getBlockNumber(): Promise<number> {
		return this.provider.getBlockNumber();
	}

	/**
	 * Get block by number or hash
	 */
	async getBlock(blockHashOrNumber: string | number): Promise<ethers.Block | null> {
		return this.provider.getBlock(blockHashOrNumber);
	}

	/**
	 * Get block with transactions
	 */
	async getBlockWithTransactions(blockHashOrNumber: string | number): Promise<ethers.Block | null> {
		return this.provider.getBlock(blockHashOrNumber, true);
	}

	// ============ Transaction Operations ============

	/**
	 * Get transaction by hash
	 */
	async getTransaction(txHash: string): Promise<TransactionResponse | null> {
		return this.provider.getTransaction(txHash);
	}

	/**
	 * Get transaction receipt
	 */
	async getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null> {
		return this.provider.getTransactionReceipt(txHash);
	}

	/**
	 * Wait for transaction confirmation
	 */
	async waitForTransaction(txHash: string, confirmations: number = 1): Promise<TransactionReceipt | null> {
		return this.provider.waitForTransaction(txHash, confirmations);
	}

	/**
	 * Estimate gas for transaction
	 */
	async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
		return this.provider.estimateGas(tx);
	}

	/**
	 * Get current gas price
	 */
	async getGasPrice(): Promise<bigint> {
		const feeData = await this.provider.getFeeData();
		return feeData.gasPrice || BigInt(0);
	}

	/**
	 * Get fee data (EIP-1559)
	 */
	async getFeeData(): Promise<ethers.FeeData> {
		return this.provider.getFeeData();
	}

	// ============ Contract Operations ============

	/**
	 * Read from contract
	 */
	async readContract(
		contractAddress: string,
		abi: string[],
		functionName: string,
		args: unknown[] = []
	): Promise<unknown> {
		const contract = new Contract(contractAddress, abi, this.provider);
		return contract[functionName](...args);
	}

	/**
	 * Write to contract
	 */
	async writeContract(
		contractAddress: string,
		abi: string[],
		functionName: string,
		args: unknown[] = [],
		options?: TransactionOptions
	): Promise<TransactionResponse> {
		const signer = this.getSigner();
		const contract = new Contract(contractAddress, abi, signer);
		
		return contract[functionName](...args, {
			gasLimit: options?.gasLimit,
			maxFeePerGas: options?.maxFeePerGas,
			maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
			value: options?.value,
			nonce: options?.nonce,
		});
	}

	/**
	 * Get contract code
	 */
	async getCode(address: string): Promise<string> {
		return this.provider.getCode(address);
	}

	/**
	 * Check if address is a contract
	 */
	async isContract(address: string): Promise<boolean> {
		const code = await this.getCode(address);
		return code !== '0x';
	}

	// ============ Event Operations ============

	/**
	 * Get contract events
	 */
	async getEvents(
		contractAddress: string,
		abi: any[],
		eventName: string,
		fromBlock: number,
		toBlock: number | 'latest' = 'latest'
	): Promise<ethers.Log[]> {
		const contract = new Contract(contractAddress, abi, this.provider);
		const filter = contract.filters[eventName]();
		const topicFilter = await filter.getTopicFilter();
		return this.provider.getLogs({
			address: contractAddress,
			topics: topicFilter as any,
			fromBlock,
			toBlock,
		});
	}

	// ============ Utility Operations ============

	/**
	 * Validate Ethereum address
	 */
	isValidAddress(address: string): boolean {
		return ethers.isAddress(address);
	}

	/**
	 * Get checksummed address
	 */
	getChecksumAddress(address: string): string {
		return ethers.getAddress(address);
	}

	/**
	 * Sign message
	 */
	async signMessage(message: string): Promise<string> {
		const signer = this.getSigner();
		return signer.signMessage(message);
	}

	/**
	 * Verify message signature
	 */
	verifyMessage(message: string, signature: string): string {
		return ethers.verifyMessage(message, signature);
	}

	/**
	 * Encode function call
	 */
	encodeFunctionCall(abi: string[], functionName: string, args: unknown[]): string {
		const iface = new ethers.Interface(abi);
		return iface.encodeFunctionData(functionName, args);
	}

	/**
	 * Decode function result
	 */
	decodeFunctionResult(abi: string[], functionName: string, data: string): ethers.Result {
		const iface = new ethers.Interface(abi);
		return iface.decodeFunctionResult(functionName, data);
	}

	/**
	 * Get chain ID
	 */
	async getChainId(): Promise<bigint> {
		const network = await this.provider.getNetwork();
		return network.chainId;
	}

	/**
	 * Get network status
	 */
	async getNetworkStatus(): Promise<{
		chainId: bigint;
		blockNumber: number;
		gasPrice: bigint;
	}> {
		const [chainId, blockNumber, gasPrice] = await Promise.all([
			this.getChainId(),
			this.getBlockNumber(),
			this.getGasPrice(),
		]);
		return { chainId, blockNumber, gasPrice };
	}
}

/**
 * Create a Beam client from n8n credentials
 */
export function createBeamClient(credentials: {
	network: string;
	rpcUrl?: string;
	privateKey?: string;
	chainId?: number;
}): BeamClient {
	return new BeamClient({
		network: credentials.network,
		rpcUrl: credentials.rpcUrl,
		privateKey: credentials.privateKey,
		chainId: credentials.chainId,
	});
}
