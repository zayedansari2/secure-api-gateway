# 🔐 Secure API Gateway

A production-ready API Gateway implementing **Diffie-Hellman key exchange** and **AES-256-CBC encryption** for secure client-server communication. This project demonstrates enterprise-grade cryptographic security patterns and modern API gateway features.

## 🏗️ Architecture

```
┌─────────────┐    HTTPS/TLS     ┌─────────────────┐    Internal     ┌─────────────┐
│             │◄─────────────────►│                 │◄───────────────►│             │
│   Client    │                  │  API Gateway    │                 │  Backend    │
│ Application │                  │   (This App)    │                 │  Services   │
│             │                  │                 │                 │             │
└─────────────┘                  └─────────────────┘                 └─────────────┘
       │                                   │                                │
       │                                   │                                │
   ┌───▼────┐                         ┌────▼────┐                      ┌────▼────┐
   │ DH Key │                         │Security │                      │Business │
   │Exchange│                         │Features │                      │ Logic   │
   │AES Enc │                         │• Rate   │                      │Database │
   └────────┘                         │  Limit  │                      │ APIs    │
                                      │• Auth   │                      └─────────┘
                                      │• Logging│
                                      └─────────┘
```

## 🔑 Why Diffie-Hellman Matters

**The Problem**: How do two parties establish a shared secret over an insecure channel without ever transmitting the secret itself?

**The Solution**: Diffie-Hellman key exchange allows:

- 🛡️ **Perfect Forward Secrecy** - Each session uses a unique key
- 🔒 **Zero Secret Transmission** - The shared secret is never sent over the network
- 🚫 **Man-in-the-Middle Resistance** - Eavesdroppers can't derive the key
- ⚡ **Efficient** - Mathematical elegance with practical performance

### How It Works

1. Server generates prime `p`, generator `g`, and private key `a`
2. Server computes public key `A = g^a mod p`
3. Client generates private key `b` and computes `B = g^b mod p`
4. Both compute shared secret: `s = A^b mod p = B^a mod p`
5. Secret `s` is used as AES encryption key

## 🛡️ Security Features

### 🔐 **Cryptographic Security**

- **Diffie-Hellman**: 2048-bit key exchange
- **AES-256-CBC**: Military-grade symmetric encryption
- **SHA-256**: Cryptographic hashing for key derivation
- **Random IV**: Unique initialization vector per encryption

### 🚪 **Gateway Security**

- **API Key Authentication**: Multi-tier access control
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Request Logging**: Comprehensive audit trail
- **Input Validation**: Prevents injection attacks

### 🏭 **Production Features**

- **Health Monitoring**: `/health` endpoint for load balancers
- **Error Handling**: Graceful failure modes
- **CORS Ready**: Cross-origin resource sharing support
- **Scalable Architecture**: Stateless design for horizontal scaling

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

### 3. Run the Client Demo

```bash
npm run client
```

## 📡 API Endpoints

| Endpoint        | Method | Description             | Auth Required |
| --------------- | ------ | ----------------------- | ------------- |
| `/`             | GET    | API documentation       | No            |
| `/health`       | GET    | Health check            | No            |
| `/init`         | GET    | Get DH parameters       | Yes           |
| `/key-exchange` | POST   | Complete key exchange   | Yes           |
| `/secure`       | POST   | Encrypted communication | Yes           |

## 🔐 Example: Encrypted Request/Response Flow

### 1. Initialize Key Exchange

```bash
curl -H "x-api-key: demo-key-123" http://localhost:3000/init
```

**Response:**

```json
{
  "prime": "MIIBCAKCAQEAw8GD7dp2lSxzskz9...",
  "generator": "Ag==",
  "serverPublicKey": "MIIBCAKCAQEAyF3k2..."
}
```

### 2. Complete Key Exchange

```bash
curl -X POST -H "x-api-key: demo-key-123" \
     -H "Content-Type: application/json" \
     -d '{"clientPublicKey":"MIIBCAKCAQEAxR7m..."}' \
     http://localhost:3000/key-exchange
```

**Response:**

```json
{
  "status": "success",
  "message": "Shared secret established"
}
```

### 3. Send Encrypted Request

```bash
curl -X POST -H "x-api-key: demo-key-123" \
     -H "Content-Type: application/json" \
     -d '{
       "encryptedData": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K14=",
       "iv": "YWJjZGVmZ2hpams="
     }' \
     http://localhost:3000/secure
```

**Encrypted Response:**

```json
{
  "encryptedData": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K14=...",
  "iv": "bXlJVkZvclRlc3Q="
}
```

**Decrypted Response Content:**

```json
{
  "message": "Request processed successfully",
  "echo": {
    "action": "get_user_data",
    "userId": 12345,
    "message": "Hello from secure client!"
  },
  "serverTime": "2024-01-15T10:30:00.000Z",
  "fakeData": {
    "userId": 12345,
    "status": "active",
    "balance": 1000.5
  }
}
```

## 🔑 Authentication

Include the API key in the `x-api-key` header:

**Demo API Keys:**

- `demo-key-123`
- `test-key-456`
- `prod-key-789`

## 🔄 Security Flow

```
Client                           API Gateway                    Backend
  │                                   │                           │
  │ 1. GET /init                      │                           │
  │ ─────────────────────────────────►│                           │
  │ ◄─────────────────────────────────│ DH params (p, g, A)      │
  │                                   │                           │
  │ 2. POST /key-exchange             │                           │
  │ ─────────────────────────────────►│                           │
  │ ◄─────────────────────────────────│ Success                   │
  │                                   │                           │
  │ 3. POST /secure (encrypted)       │                           │
  │ ─────────────────────────────────►│ ──────────────────────────►│
  │ ◄─────────────────────────────────│ ◄──────────────────────────│
  │   Encrypted response              │   Business logic          │
```

## 🚀 Deployment

### Deploy to Render (Recommended)

1. **Push to GitHub:**

```bash
git init
git add .
git commit -m "Initial commit: Secure API Gateway"
git branch -M main
git remote add origin https://github.com/yourusername/secure-api-gateway.git
git push -u origin main
```

2. **Deploy on Render:**

   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Choose "Web Service"
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node.js

3. **Environment Variables:**
   - `NODE_ENV=production`
   - `PORT=10000` (Render default)

### Deploy to Railway

1. **Install Railway CLI:**

```bash
npm install -g @railway/cli
```

2. **Deploy:**

```bash
railway login
railway init
railway up
```

### Deploy to Glitch

1. Go to [glitch.com](https://glitch.com)
2. Import from GitHub
3. Your app will be live instantly

## 🛠️ Development

```bash
# Development with auto-reload
npm run dev

# Run client demo
npm run client

# Test all endpoints
npm test
```

## 📊 Performance & Monitoring

- **Health Check**: `GET /health` for uptime monitoring
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Request Logging**: Full audit trail for security analysis
- **Error Handling**: Graceful degradation and informative error messages

## 🏆 Why This Project Matters

This implementation showcases:

1. **Advanced Cryptography**: Real-world application of DH key exchange
2. **Security Best Practices**: Defense in depth with multiple security layers
3. **Production Readiness**: Enterprise-grade features and error handling
4. **Modern Architecture**: Scalable, stateless design patterns
5. **Full-Stack Understanding**: Client-server cryptographic communication

Perfect for demonstrating security engineering skills and cryptographic knowledge in technical interviews and portfolio reviews.

## 📝 License

MIT License - feel free to use this in your portfolio and projects!

---

**Built with ❤️ and 🔐 by [Your Name]**

_Demonstrating enterprise-grade security engineering and cryptographic implementation skills._
