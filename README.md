# n8n-nodes-beam

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with the Beam blockchain ecosystem, offering 6 core resources for wallet management, transaction processing, marketplace interactions, gaming operations, and DeFi protocols. Build powerful automation workflows with Beam's privacy-focused blockchain infrastructure.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Beam](https://img.shields.io/badge/Beam-Blockchain-purple)
![Privacy](https://img.shields.io/badge/Privacy-Focused-green)
![DeFi](https://img.shields.io/badge/DeFi-Ready-orange)

## Features

- **Wallet Operations** - Create, manage, and monitor Beam wallets with full balance tracking
- **Transaction Management** - Send, receive, and query transactions with privacy features
- **Marketplace Integration** - Access SphereMarketplace for NFT and asset trading
- **Gaming Support** - Integrate with Beam's gaming ecosystem and reward systems
- **DeFi Protocols** - Connect to decentralized finance applications and yield farming
- **Privacy Controls** - Leverage Beam's confidential transactions and privacy features
- **Real-time Monitoring** - Track blockchain events and transaction confirmations
- **Multi-network Support** - Works with Beam mainnet and testnet environments

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-beam`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-beam
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-beam.git
cd n8n-nodes-beam
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-beam
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Beam API access key | Yes |
| Environment | Network environment (mainnet/testnet) | Yes |
| Wallet Address | Default wallet address for operations | No |
| Node URL | Custom Beam node URL (optional) | No |

## Resources & Operations

### 1. Wallet

| Operation | Description |
|-----------|-------------|
| Create | Generate a new Beam wallet |
| Get Balance | Retrieve wallet balance and assets |
| Get Info | Get wallet details and metadata |
| Import | Import existing wallet from seed phrase |
| List Transactions | Get wallet transaction history |
| Export Keys | Export wallet private keys securely |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| Send | Send Beam or assets to another address |
| Get | Retrieve transaction details by ID |
| List | Query transactions with filters |
| Cancel | Cancel pending transactions |
| Estimate Fee | Calculate transaction fees |
| Sign | Sign transaction data |
| Broadcast | Broadcast signed transaction |

### 3. Unknown

| Operation | Description |
|-----------|-------------|
| Query | Execute custom blockchain queries |
| Monitor | Track blockchain events |
| Validate | Validate addresses and transactions |

### 4. SphereMarketplace

| Operation | Description |
|-----------|-------------|
| List Assets | Browse available NFTs and assets |
| Get Asset | Get detailed asset information |
| Create Listing | List assets for sale |
| Buy Asset | Purchase marketplace assets |
| Cancel Listing | Remove asset listings |
| Get Collections | Browse NFT collections |
| Search | Search marketplace items |

### 5. Gaming

| Operation | Description |
|-----------|-------------|
| Get Profile | Retrieve gaming profile data |
| Get Achievements | List player achievements |
| Get Leaderboard | Access game leaderboards |
| Claim Rewards | Claim gaming rewards |
| Get Game Stats | Retrieve game statistics |
| Join Tournament | Register for tournaments |

### 6. DeFi

| Operation | Description |
|-----------|-------------|
| Get Pools | List available liquidity pools |
| Add Liquidity | Provide liquidity to pools |
| Remove Liquidity | Withdraw from liquidity pools |
| Swap Tokens | Execute token swaps |
| Get Rates | Get current exchange rates |
| Stake Tokens | Stake tokens for rewards |
| Unstake | Withdraw staked tokens |
| Claim Yields | Claim farming rewards |

## Usage Examples

```javascript
// Send Beam tokens
{
  "operation": "send",
  "amount": 100,
  "to": "beam1qyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqs7a4r6s",
  "comment": "Payment for services",
  "fee": 1000
}
```

```javascript
// Get wallet balance
{
  "operation": "getBalance",
  "walletAddress": "beam1qyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqs7a4r6s",
  "includeAssets": true
}
```

```javascript
// List marketplace assets
{
  "operation": "listAssets",
  "category": "nft",
  "priceRange": {
    "min": 10,
    "max": 1000
  },
  "sortBy": "price_asc"
}
```

```javascript
// Add liquidity to DeFi pool
{
  "operation": "addLiquidity",
  "poolId": "beam-usdc",
  "amountA": 500,
  "amountB": 1000,
  "slippage": 0.5
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed | Verify API key in credentials |
| Insufficient Balance | Not enough funds for transaction | Check wallet balance before sending |
| Network Timeout | Request timed out | Check network connection and node status |
| Invalid Address | Wallet address format incorrect | Validate Beam address format |
| Transaction Failed | Blockchain rejected transaction | Check fee amount and network congestion |
| Rate Limited | Too many API requests | Implement delays between requests |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-beam/issues)
- **Beam Documentation**: [Beam Developer Docs](https://beam.mw/docs)
- **Community**: [Beam Discord](https://discord.gg/beam)