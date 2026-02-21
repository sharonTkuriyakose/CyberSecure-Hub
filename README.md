🛡️ CyberSecure-Hub: Technical Architecture & Workflow
CyberSecure-Hub is a zero-knowledge security ecosystem designed for operatives to manage digital assets with military-grade protection. The platform utilizes the MERN stack to provide an end-to-end encrypted environment where the server never has access to raw user data.

🔐 The Security Workflow
The platform follows a strict "Verify-First" protocol to ensure only authorized operatives can access the Command Center.

1. Multi-Factor Authentication (MFA) Journey
The authentication process is a three-tier handshake designed to eliminate unauthorized access:

Credential Verification: The operative provides system email and a master access key.

OTP Transmission: Upon successful credential check, a 6-digit One-Time Password is sent via a secure email utility.

Session Initialization: After OTP verification, the system clears stale data, preserves theme preferences, and issues a JWT-signed session token.

2. Zero-Knowledge Encryption Logic
The core of the "Hub" is its zero-knowledge architecture. This means the encryption happens locally on your machine before the data is ever sent to the database.

Local Encryption: Content in the Secure Notes vault is encrypted using AES-256 on the client side.

Encrypted Storage: Only the encrypted "ciphertext" is stored in MongoDB.

Decryption on Demand: Data is only decrypted in the browser when the operative is actively viewing the notes with the local secret key.

🖥️ Command Center Interface
The Dashboard serves as the operative's central HUD (Heads-Up Display), providing a real-time overview of all secured assets.

Secure Notes: Access E2EE notes encrypted with AES-256 standards.

File Vault: Secure asset storage with Cloudinary integration.

Password Manager: High-security credential management with visibility toggles.

Key Generator: Local entropy-based generator for industrial-strength keys.

🎨 Global Theming & Persistence
The platform features a system-wide theme synchronization that allows for seamless transitions between operational environments.

CSS Variables: The entire UI is driven by variables (e.g., var(--bg-primary)), allowing for instant theme switching across all vaults.

Local Persistence: Theme choices are stored in localStorage, ensuring the hub remembers the operative's preference across sessions.

Responsive Design: The Sidebar and Dashboard are optimized for high-intensity monitoring, ensuring clarity in both light and dark modes.

Project Lead: Sharon T Kuriyakose