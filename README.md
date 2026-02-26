# 🛡️ CyberSecure-Hub  
### Zero-Knowledge MERN Security Dashboard

---

## 🚀 Visual Tech Stack

<p align="center">

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/API-Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Supabase](https://img.shields.io/badge/Storage-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

</p>

---

## 🧠 Architecture Overview

<p align="center">
  <img src="./assets/architecture-banner.png" alt="CyberSecure-Hub Architecture Diagram" width="100%" />
</p>

> A Zero-Knowledge MERN ecosystem where **the server never has access to raw user data**.

---

# 🛡️ CyberSecure-Hub: Technical Architecture & Workflow

CyberSecure-Hub is a **Zero-Knowledge Security Dashboard** built on the MERN stack, designed to function as a high-security intelligence command center.

The core philosophy:

> 🔐 **If the server never sees plaintext, it can never leak plaintext.**

---

## 🔐 Core Logic — Zero-Knowledge Ecosystem

CyberSecure-Hub operates under a strict **client-side encryption model**:

- All sensitive data is encrypted in the browser
- AES-256 encryption is performed before transmission
- The backend only stores encrypted ciphertext
- Decryption occurs exclusively on the client

### 🔎 What This Means

- The server **cannot read user notes**
- The database **cannot access file contents**
- Even if breached, attackers retrieve only encrypted payloads

This architecture ensures:

✔️ True data privacy  
✔️ Reduced attack surface  
✔️ Zero raw exposure risk  

---

## 🔑 Security Workflow — Three-Tier MFA Handshake

CyberSecure-Hub implements a structured Multi-Factor Authentication (MFA) journey:

### 🧾 1️⃣ Credential Verification
- Email + password validation
- Password hashed before database comparison
- Initial session token withheld

### 📲 2️⃣ OTP Transmission
- One-Time Password generated
- Secure delivery via verified channel
- Time-bound validation window

### 🖥️ 3️⃣ Session Initialization
- OTP verification success triggers session creation
- Secure JWT issued
- Encrypted session context established

This layered handshake ensures:

- No direct login bypass
- Controlled authentication flow
- Secure session lifecycle management

---

## 🔒 Encryption Logic — AES-256 Client-Side

CyberSecure-Hub uses **AES-256 symmetric encryption** via CryptoJS.

### Encryption Flow

1. User inputs secure data
2. Data encrypted locally using AES-256
3. Ciphertext transmitted to backend
4. MongoDB stores only encrypted strings
5. On retrieval, decryption occurs client-side

### 🗄️ Database Behavior

MongoDB stores:

```json
{
  "title": "Encrypted String",
  "content": "U2FsdGVkX1+XzP...",
  "metadata": "Encrypted Blob"
}