# Secure API Gateway

A production-ready API Gateway with **Diffie-Hellman key exchange** and **AES-256-CBC encryption** for secure client-server communication.

## What It Does

This API gateway establishes encrypted communication channels between clients and backend services using cryptographic key exchange. No shared secrets are ever transmitted over the network.

**Key Features:**

- Diffie-Hellman 2048-bit key exchange for perfect forward secrecy
- AES-256-CBC encryption with unique IVs per request
- API key authentication with rate limiting
- Health monitoring and request logging
- Interactive web demo at `https://secure-api-gateway-f7q4.onrender.com/`

## Why It's Good

**Security**: Military-grade encryption with zero secret transmission. Each session uses a unique key that can't be derived by eavesdroppers.

**Production Ready**: Built-in rate limiting, health checks, error handling, and comprehensive logging for enterprise deployment.

**Educational**: Demonstrates real-world cryptographic implementation patterns and secure API design principles.

## Quick Start

```bash
npm install
npm start
```

Visit `https://secure-api-gateway-f7q4.onrender.com` for the interactive demo.

**Demo API Keys:** `demo-key-123`, `test-key-456`, `prod-key-789`

## API Flow

1. **GET /init** - Get Diffie-Hellman parameters
2. **POST /key-exchange** - Establish shared secret
3. **POST /secure** - Send encrypted requests

All endpoints require `x-api-key` header except `/health` and `/`.
