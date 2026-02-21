import CryptoJS from 'crypto-js';

// This 'Master Key' should ideally be set by the user during login 
// and stored in a secure session state, not hardcoded.
const MASTER_KEY = "your-secret-vault-key"; 

/**
 * Encrypts plaintext into AES ciphertext
 */
export const encryptData = (text) => {
  return CryptoJS.AES.encrypt(text, MASTER_KEY).toString();
};

/**
 * Decrypts AES ciphertext back into plaintext
 */
export const decryptData = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, MASTER_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};