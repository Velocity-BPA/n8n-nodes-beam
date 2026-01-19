# n8n-nodes-beam

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

---

A comprehensive n8n community node for the [Beam blockchain](https://www.onbeam.com/) - a gaming-focused Avalanche subnet backed by Merit Circle DAO. This node provides extensive integration capabilities for wallet management, NFT operations, gaming ecosystems, DeFi, and cross-chain bridging.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)

## Features

- **17 Resource Types** with 150+ operations
- **Wallet Management**: Balance checks, transfers, wrap/unwrap BEAM
- **NFT Operations**: Get info, transfer, batch transfer, burn, verify ownership
- **Sphere Marketplace**: Listings, offers, sales, price history
- **Gaming Ecosystem**: Games, players, inventory, achievements, leaderboards
- **DeFi**: DEX swaps, liquidity pools, staking
- **Cross-Chain Bridge**: Ethereum, Avalanche bridge support
- **Smart Contracts**: Read/write, deploy, events
- **Real-Time Triggers**: Block events, transfers, contract events

## Installation

### Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-beam` and click **Install**

### Manual Installation

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-beam
```

### Development Installation

```bash
# 1. Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-beam.git
cd n8n-nodes-beam

# 2. Install dependencies
pnpm install

# 3. Build the project
pnpm build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-beam

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-beam %CD%

# 5. Restart n8n
n8n start
```

## Credentials Setup

### Beam Network Credentials

| Field | Description |
|-------|-------------|
| Network | Select mainnet, testnet, or custom |
| RPC URL | Custom RPC endpoint (optional) |
| Private Key | Wallet private key for signing transactions |
| Chain ID | Auto-populated (4337 mainnet, 13337 testnet) |

### Beam API Credentials

| Field | Description |
|-------|-------------|
| API Endpoint | Beam API URL |
| API Key | Your Beam API key |
| Project ID | Your project identifier |

### Sphere Marketplace Credentials

| Field | Description |
|-------|-------------|
| API Endpoint | Sphere API URL |
| API Key | Your Sphere API key |
| Publisher ID | Your publisher identifier |

## Resources & Operations

### Wallet
- Get BEAM Balance, Get Wrapped BEAM Balance, Get Token Balances
- Get Wallet NFTs, Transfer BEAM, Transfer Token
- Get Transaction History, Validate Address, Wrap/Unwrap BEAM

### NFT
- Get NFT Info, Get NFT Metadata, Get NFTs by Owner/Collection
- Transfer NFT, Batch Transfer, Get History, Verify Ownership, Burn

### Collection
- Get Collection Info/Stats/NFTs/Activity
- Create/Update Collection, Search, Get Floor Price/Volume/Holders

### Marketplace (Sphere)
- Get/Create/Cancel Listing, Buy NFT
- Get Active Listings, Listings by User/Collection
- Get Recent Sales, Price History, Make/Accept/Cancel Offer

### Minting
- Mint NFT, Batch Mint, Get Mint Status
- Prepare Mint, Get Fees, Create/Purchase Drop

### Gaming
- Get Game Info/Stats, Get Available Games
- Get Player Profile/Inventory/Achievements
- Get Leaderboard, Execute Game Action, Claim Rewards

### Player
- Get Player Info/Stats/NFTs/History/Ranking
- Link Account, Update Profile, Get Achievements/Rewards

### Asset (In-Game)
- Get Asset Info/Stats/Attributes/History/Value
- Upgrade Asset, Combine Assets, List/Delist Asset

### Merit Circle
- Get MC Token Balance, Staking Info/Rewards
- Stake/Unstake MC, Claim Rewards
- Get Governance Info, DAO Stats, Vote on Proposal

### Smart Contract
- Read/Write Contract, Deploy Contract
- Encode/Decode Functions, Get Events, Estimate Gas

### Bridge
- Get Bridge Info, Supported Assets
- Bridge from/to Ethereum, Bridge from Avalanche
- Get Bridge Status/History, Estimate Fees

### DEX
- Get Swap Quote, Execute Swap
- Get Pool Info, Add/Remove Liquidity
- Get LP Balance, Supported Pairs, Price Impact

### Staking
- Get Staking Info, Stake/Unstake BEAM
- Get Validators, Delegate, Get Rewards/APY

### Block
- Get Block (by number/hash), Get Latest Block
- Get Block Transactions/Time, Get Finalized Block

### Transaction
- Send Transaction, Get Transaction/Receipt/Status
- Estimate Gas, Get Gas Price, Speed Up/Cancel Transaction

### Events
- Get Events (filtered), Decode Event
- Get Events by Contract, Transfer/Approval Events

### Utility
- Convert Units, Encode/Decode ABI
- Sign/Verify Message, Hash Data, Validate Address, Get Network Status

## Trigger Node

The **Beam Trigger** node monitors real-time events:

- BEAM Received/Sent
- Token Transfers
- NFT Transfers
- New Blocks
- Contract Events

## Usage Examples

### Check Wallet Balance

```javascript
// Get BEAM balance for an address
Resource: Wallet
Operation: Get BEAM Balance
Wallet Address: 0x1234...
```

### Transfer NFT

```javascript
// Transfer an NFT to another address
Resource: NFT
Operation: Transfer NFT
Contract Address: 0xNFT...
Token ID: 123
To Address: 0xRecipient...
```

### Create Marketplace Listing

```javascript
// List an NFT for sale on Sphere
Resource: Marketplace
Operation: Create Listing
Contract Address: 0xNFT...
Token ID: 123
Price: 10.5
```

### Execute Token Swap

```javascript
// Swap tokens on BeamSwap DEX
Resource: DEX
Operation: Execute Swap
Token In: 0xTokenA...
Token Out: 0xTokenB...
Amount In: 100
Slippage Tolerance: 0.5
```

## Beam Blockchain Concepts

### BEAM Token
The native token of the Beam network, used for gas fees and transactions.

### Avalanche Subnet
Beam is built as an Avalanche subnet, providing high throughput and low latency transactions.

### Merit Circle DAO
The gaming DAO that backs and governs the Beam ecosystem.

### Sphere Marketplace
The official NFT marketplace for the Beam ecosystem.

### Gaming Focus
Purpose-built for Web3 gaming with player profiles, in-game assets, and cross-game interoperability.

## Networks

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Beam Mainnet | 4337 | https://build.onbeam.com/rpc |
| Beam Testnet | 13337 | https://build.onbeam.com/rpc/testnet |

## Contract Addresses (Mainnet)

| Contract | Address |
|----------|---------|
| Wrapped BEAM | `0x76BF5E7d2Bcb06b1444C0a2742780051D8D0E304` |
| Sphere Marketplace | `0x8A3749936E723325C6b645a0901470cD9E790B94` |
| BeamSwap Router | `0x965B104e250648d01d4B3b72BaC751Cde809D29E` |
| MC Token | `0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6` |

## Error Handling

The node provides descriptive error messages for common issues:

- **Invalid Address**: Validates Ethereum-style addresses
- **Insufficient Balance**: Checks balance before transactions
- **Network Errors**: Handles RPC connection issues
- **Contract Errors**: Decodes revert reasons when available

## Security Best Practices

- **Never share private keys** - Store credentials securely in n8n
- **Use testnet first** - Test workflows on Beam testnet before mainnet
- **Validate addresses** - Always verify recipient addresses
- **Set gas limits** - Configure appropriate gas limits for transactions
- **Monitor transactions** - Use triggers to track transaction status

## Development

### Project Structure

```
n8n-nodes-beam/
├── credentials/
│   ├── BeamNetwork.credentials.ts
│   ├── BeamApi.credentials.ts
│   └── SphereMarketplace.credentials.ts
├── nodes/
│   └── Beam/
│       ├── Beam.node.ts
│       ├── BeamTrigger.node.ts
│       ├── beam.svg
│       ├── actions/
│       ├── transport/
│       ├── constants/
│       └── utils/
├── test/
│   ├── unit/
│   └── integration/
├── scripts/
│   ├── test.sh
│   ├── build.sh
│   └── install-local.sh
├── package.json
├── tsconfig.json
├── jest.config.js
├── LICENSE
├── COMMERCIAL_LICENSE.md
└── LICENSING_FAQ.md
```

### Build Commands

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run development mode (watch)
pnpm dev

# Lint code
pnpm lint

# Fix linting issues
pnpm lintfix

# Format code
pnpm format

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

### Testing

```bash
# Run unit tests
pnpm test

# Run tests with coverage report
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code passes linting and tests before submitting.

## Support

- [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-beam/issues)
- [Beam Documentation](https://docs.onbeam.com/)
- [n8n Community](https://community.n8n.io/)

## Acknowledgments

- [Beam](https://www.onbeam.com/) - Gaming-focused blockchain
- [Merit Circle](https://meritcircle.io/) - Gaming DAO
- [Sphere](https://sphere.onbeam.com/) - NFT Marketplace
- [n8n](https://n8n.io/) - Workflow automation platform
