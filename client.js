// client.js - Secure API Gateway Client
const crypto = require("crypto");
const axios = require("axios");

const SERVER_URL = "https://secure-api-gateway-f7q4.onrender.com";
const API_KEY = "demo-key-123";

// AES-256-CBC encryption function (matches server)
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

// AES-256-CBC decryption function (matches server)
function decrypt(encryptedData, key, ivBase64) {
  const keyBuffer = crypto.createHash("sha256").update(key).digest();
  const iv = Buffer.from(ivBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function secureClientDemo() {
  try {
    console.log("🚀 Starting Secure API Gateway Client Demo");
    console.log("=".repeat(50));

    // Step 1: Initialize Diffie-Hellman exchange
    console.log("📡 Step 1: Fetching DH parameters from /init");
    const initResponse = await axios.get(`${SERVER_URL}/init`, {
      headers: { "x-api-key": API_KEY },
    });

    const { prime, generator, serverPublicKey } = initResponse.data;
    console.log("✅ Received DH parameters from server");

    // Step 2: Generate client DH keypair
    console.log("🔐 Step 2: Generating client DH keypair");
    const clientDH = crypto.createDiffieHellman(Buffer.from(prime, "base64"));
    clientDH.setPublicKey(Buffer.from(generator, "base64"));
    const clientKeys = clientDH.generateKeys();

    // Step 3: Complete key exchange
    console.log("🤝 Step 3: Completing key exchange");
    const keyExchangeResponse = await axios.post(
      `${SERVER_URL}/key-exchange`,
      {
        clientPublicKey: clientKeys.toString("base64"),
      },
      {
        headers: { "x-api-key": API_KEY },
      }
    );

    // Compute shared secret on client side
    const sharedSecret = clientDH
      .computeSecret(Buffer.from(serverPublicKey, "base64"))
      .toString("base64");

    console.log("✅ Key exchange completed successfully");
    console.log(`🔑 Shared secret: ${sharedSecret.substring(0, 10)}...`);

    // Step 4: Send encrypted request
    console.log("🔒 Step 4: Sending encrypted request to /secure");
    const requestData = {
      action: "get_user_data",
      userId: 12345,
      message: "Hello from secure client!",
      timestamp: new Date().toISOString(),
    };

    const encryptedRequest = encrypt(JSON.stringify(requestData), sharedSecret);
    console.log("📤 Request encrypted and sent");

    const secureResponse = await axios.post(
      `${SERVER_URL}/secure`,
      encryptedRequest,
      {
        headers: { "x-api-key": API_KEY },
      }
    );

    // Step 5: Decrypt response
    console.log("🔓 Step 5: Decrypting server response");
    const { encryptedData, iv } = secureResponse.data;
    const decryptedResponse = decrypt(encryptedData, sharedSecret, iv);
    const responseData = JSON.parse(decryptedResponse);

    console.log("✅ Response decrypted successfully!");
    console.log("=".repeat(50));
    console.log("📋 DECRYPTED SERVER RESPONSE:");
    console.log(JSON.stringify(responseData, null, 2));
    console.log("=".repeat(50));
    console.log("🎉 End-to-end secure communication successful!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Server response:", error.response.data);
    }
  }
}

// Run the demo
secureClientDemo();
