# n8n-nodes-beam

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for integrating with Beam blockchain network. This node provides access to 5 core resources including wallet management, transaction processing, address operations, asset management, and node information retrieval with full support for Beam's privacy-focused blockchain capabilities.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Beam](https://img.shields.io/badge/Beam-Blockchain-purple)
![Privacy](https://img.shields.io/badge/Privacy-Focused-green)
![MimbleWimble](https://img.shields.io/badge/MimbleWimble-Protocol-orange)

## Features

- **Wallet Management** - Create, manage, and monitor Beam wallets with full balance tracking
- **Transaction Processing** - Send, receive, and query transactions on the Beam network
- **Address Operations** - Generate and validate Beam addresses with privacy controls
- **Asset Management** - Handle Beam native tokens and confidential assets
- **Node Information** - Access blockchain status, sync progress, and network statistics
- **Privacy Controls** - Leverage Beam's MimbleWimble protocol for confidential transactions
- **Error Handling** - Comprehensive error management with detailed response codes
- **Type Safety** - Full TypeScript support for reliable automation workflows

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
| API Key | Your Beam wallet API key for authentication | Yes |
| Wallet Password | Password for wallet operations (if required) | No |
| Node URL | Custom Beam node URL (defaults to local node) | No |

## Resources & Operations

### 1. Wallet

| Operation | Description |
|-----------|-------------|
| Get Status | Retrieve wallet status and synchronization information |
| Get Balance | Get current wallet balance and available funds |
| Create Address | Generate new receiving addresses |
| Validate Address | Verify address format and validity |
| Export Seed | Export wallet seed phrase for backup |
| Import Data | Import wallet data from backup |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| Send | Send BEAM or assets to specified address |
| Cancel | Cancel pending transaction |
| Get List | Retrieve transaction history with filtering |
| Get Details | Get detailed information about specific transaction |
| Get UTXO | List unspent transaction outputs |
| Split UTXO | Split UTXO for better privacy management |

### 3. Address

| Operation | Description |
|-----------|-------------|
| Create | Generate new address with optional expiration |
| List | Get all addresses associated with wallet |
| Edit | Modify address properties and labels |
| Delete | Remove address from wallet |
| Validate | Check if address is valid Beam address |
| Get Info | Retrieve detailed address information |

### 4. Asset

| Operation | Description |
|-----------|-------------|
| Get List | List all available assets in wallet |
| Get Info | Get detailed asset information and metadata |
| Issue | Create new confidential asset |
| Consume | Burn/consume existing asset |
| Get Balance | Check balance for specific asset |
| Transfer | Send asset to another address |

### 5. Node

| Operation | Description |
|-----------|-------------|
| Get Status | Retrieve node synchronization status |
| Get Network | Get network information and peers |
| Get Version | Check node software version |
| Get Peers | List connected peer nodes |
| Get Height | Get current blockchain height |
| Get Difficulty | Retrieve current mining difficulty |

## Usage Examples

```javascript
// Send BEAM transaction
{
  "operation": "send",
  "address": "beam1qyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqs",
  "value": 1000000000, // 10 BEAM in groth
  "comment": "Payment for services"
}
```

```javascript
// Create new address
{
  "operation": "create",
  "type": "regular",
  "expiration": "24h",
  "comment": "Invoice payment address"
}
```

```javascript
// Get transaction history
{
  "operation": "getList",
  "filter": {
    "status": "completed",
    "height": {
      "from": 1500000,
      "to": 1600000
    }
  }
}
```

```javascript
// Check wallet balance
{
  "operation": "getBalance",
  "assets": true,
  "nzOnly": true
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| InvalidAddress | Provided address format is incorrect | Verify address format and checksum |
| InsufficientFunds | Wallet balance too low for transaction | Check balance and reduce amount |
| NodeNotSynced | Wallet node is not synchronized | Wait for sync completion or check connection |
| InvalidAmount | Transaction amount is invalid or too small | Use valid amount (minimum 1 groth) |
| WalletLocked | Wallet requires password authentication | Provide correct wallet password |
| NetworkError | Cannot connect to Beam node | Check node URL and network connectivity |

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
- **Beam Documentation**: [Beam Documentation](https://beam.mw/docs)
- **API Reference**: [Beam Wallet API](https://github.com/BeamMW/beam/wiki/Beam-wallet-protocol-API)