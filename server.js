// server.js
const express = require("express");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());

// Serve static files from public directory
app.use(express.static("public"));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`📝 [${timestamp}] ${method} ${url} - IP: ${ip}`);
  next();
});

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const validApiKeys = ["demo-key-123", "test-key-456", "prod-key-789"];

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  if (!validApiKeys.includes(apiKey)) {
    console.log(`🚫 Invalid API key attempted: ${apiKey}`);
    return res.status(403).json({ error: "Invalid API key" });
  }

  console.log(`✅ Valid API key used: ${apiKey}`);
  next();
};

// Create Diffie-Hellman object with 2048-bit prime
const dh = crypto.createDiffieHellman(2048);
const serverPrivateKey = dh.generateKeys();
const prime = dh.getPrime("base64");
const generator = dh.getGenerator("base64");

let sharedSecret = null;

// AES-256-CBC encryption function
function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const keyBuffer = crypto.createHash("sha256").update(key).digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return {
    iv: iv.toString("base64"),
    encryptedData: encrypted,
  };
}

// AES-256-CBC decryption function
function decrypt(encryptedData, key, ivBase64) {
  const keyBuffer = crypto.createHash("sha256").update(key).digest();
  const iv = Buffer.from(ivBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Step 1: Client requests public DH values (with API key validation)
app.get("/init", validateApiKey, (req, res) => {
  console.log("🔐 DH initialization requested");
  res.json({
    prime: prime,
    generator: generator,
    serverPublicKey: serverPrivateKey.toString("base64"),
  });
});

// Step 2: Client sends its public key; server computes shared secret
app.post("/key-exchange", validateApiKey, (req, res) => {
  const clientPublicKey = Buffer.from(req.body.clientPublicKey, "base64");
  sharedSecret = dh.computeSecret(clientPublicKey).toString("base64");

  console.log(
    "🔑 Shared secret established:",
    sharedSecret.substring(0, 10) + "..."
  );
  res.json({ status: "success", message: "Shared secret established" });
});

// Step 3: Secure route that handles encrypted requests
app.post("/secure", validateApiKey, (req, res) => {
  if (!sharedSecret) {
    return res.status(400).json({
      error: "No shared secret established. Complete key exchange first.",
    });
  }

  try {
    const { encryptedData, iv } = req.body;

    // Decrypt the incoming request
    const decryptedRequest = decrypt(encryptedData, sharedSecret, iv);
    console.log("🔓 Decrypted request:", decryptedRequest);

    // Process the request (echo back with some fake data)
    const requestData = JSON.parse(decryptedRequest);
    const responseData = {
      message: "Request processed successfully",
      echo: requestData,
      serverTime: new Date().toISOString(),
      fakeData: {
        userId: 12345,
        status: "active",
        balance: 1000.5,
      },
    };

    // Encrypt the response
    const encryptedResponse = encrypt(
      JSON.stringify(responseData),
      sharedSecret
    );
    console.log("🔒 Sending encrypted response");

    res.json(encryptedResponse);
  } catch (error) {
    console.error("❌ Error processing secure request:", error.message);
    res.status(400).json({ error: "Failed to process encrypted request" });
  }
});

// Health check route (no API key required)
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
  });
});

// Redirect root to the visual demo
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Secure API Gateway server is running 🚀",
    endpoints: {
      "/health": "GET - Health check (no API key required)",
      "/init": "GET - Initialize DH key exchange (requires API key)",
      "/key-exchange": "POST - Complete key exchange (requires API key)",
      "/secure": "POST - Encrypted communication (requires API key)",
    },
    apiKeyHeader: "x-api-key",
    demoApiKeys: ["demo-key-123", "test-key-456"],
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Secure API Gateway started");
  console.log(`📍 Server listening on port ${PORT}`);
  console.log("🔒 Features enabled:");
  console.log("   • Diffie-Hellman key exchange");
  console.log("   • AES-256-CBC encryption");
  console.log("   • Rate limiting (100 req/15min)");
  console.log("   • Request logging");
  console.log("   • API key validation");
  console.log("🔑 Demo API keys: demo-key-123, test-key-456");
});
