const CryptoJS = require('crypto-js');

// Derive encryption key from JWT_SECRET
const getKey = () => process.env.JWT_SECRET || 'fallback_key';

// Encrypt data using AES
const encryptData = (data, key) => {
  const encryptionKey = key || getKey();
  const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
  return CryptoJS.AES.encrypt(stringData, encryptionKey).toString();
};

// Decrypt data using AES
const decryptData = (encryptedData, key) => {
  const encryptionKey = key || getKey();
  const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  // Try to parse as JSON, return raw string if it fails
  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
};

module.exports = { encryptData, decryptData };
