# 🛡️ CyberSecure-Hub  
### Zero-Knowledge MERN Security Dashboard

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
  <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1600&auto=format&fit=crop" alt="Cybersecurity Architecture Illustration" width="100%" />
</p>

> A Zero-Knowledge MERN ecosystem where **the server never has access to raw user data.**

---

# 🛡️ CyberSecure-Hub: Technical Architecture & Workflow

CyberSecure-Hub is a high-security intelligence-inspired dashboard built on the **MERN stack**, engineered around a strict **Zero-Knowledge architecture**.

> 🔐 If the server never sees plaintext, it can never leak plaintext.

---

## 🔐 Core Logic — Zero-Knowledge Ecosystem

CyberSecure-Hub follows a client-first encryption model:

- All sensitive data is encrypted in the browser
- AES-256 encryption occurs before transmission
- Backend stores only ciphertext
- Decryption happens exclusively client-side

### 🔎 Security Implications

- The server **cannot read user notes**
- The database **cannot access file contents**
- Even in the event of a breach, only encrypted payloads exist

✔️ True user privacy  
✔️ Reduced attack surface  
✔️ Encrypted-by-design architecture  

---

## 🔑 Security Workflow — Three-Tier MFA Handshake

CyberSecure-Hub implements a structured Multi-Factor Authentication system.

### 1️⃣ Credential Verification
- Email and password validation
- Secure password hashing
- Pre-session verification stage

### 2️⃣ OTP Transmission
- One-Time Password generation
- Secure channel delivery
- Time-bound verification window

### 3️⃣ Session Initialization
- OTP validation success
- Secure JWT issuance
- Encrypted session context creation

This layered authentication prevents:

- Unauthorized access  
- Session hijacking  
- Direct login bypass  

---

## 🔒 Encryption Logic — AES-256 Client-Side

CyberSecure-Hub uses **AES-256 symmetric encryption** (CryptoJS implementation).

### Encryption Flow

1. User inputs sensitive data  
2. Data encrypted locally (AES-256)  
3. Ciphertext transmitted to backend  
4. MongoDB stores encrypted strings only  
5. Data decrypted client-side when required  

### 🗄️ Example Database Record

```json
{
  "title": "U2FsdGVkX1+EncryptedBlob",
  "content": "U2FsdGVkX1+EncryptedBlob",
  "metadata": "EncryptedPayload"
}
```

Never stored:

❌ Plaintext  
❌ Raw credentials  
❌ Decrypted file data  

---

## 🖥️ Command Center Interface (HUD)

CyberSecure-Hub features a futuristic, intelligence-grade dashboard.

### 📓 Secure Notes Vault
- Glassmorphism card system  
- Targeting bracket UI accents  
- On-demand local decryption  
- Responsive grid layout  

### 📁 File Vault
- Folder-style organization  
- Supabase Storage integration  
- Secure Signed URL access  
- Icon-based rendering for non-image files  

### 🔑 Password Manager
- Encrypted credential vault  
- Controlled reveal mechanism  
- Clipboard-safe interaction  
- Session-bound visibility  

All modules operate within the Zero-Knowledge model.

---

## 🎨 Styling & UI System

CyberSecure-Hub is designed as a high-contrast intelligence dashboard.

### 🌌 Design Language

- Deep Sky Blue + Onyx dark theme  
- Glassmorphism panels (12px blur)  
- Neon blue glow accents  
- JetBrains Mono typography  
- Targeting bracket visual elements  

### ⚙️ Technical Styling System

- CSS Variable-driven theming  
- Dynamic theme switching  
- Dark-mode optimized contrast  
- Theme persistence via `localStorage`  
- Tailwind CSS responsive grid system  

---

## 🛠️ Tech Stack Breakdown

| Layer        | Technology                  | Purpose                                |
|-------------|----------------------------|----------------------------------------|
| Frontend     | React.js + Tailwind CSS    | Command Center UI                     |
| Backend      | Node.js + Express.js       | API & Authentication Engine            |
| Database     | MongoDB                    | Encrypted metadata storage             |
| File Storage | Supabase                   | Secure file hosting (Signed URLs)      |
| Encryption   | CryptoJS (AES-256)         | Client-side data protection            |

---

## ⏱️ Session Protection

CyberSecure-Hub includes:

- 🕒 15-minute inactivity auto-logout  
- Secure JWT lifecycle management  
- Encrypted session storage  
- Controlled re-authentication flow  

---

## 📌 Why CyberSecure-Hub?

✔️ Zero-Knowledge Architecture  
✔️ Client-Side Encryption First  
✔️ MFA-Driven Authentication  
✔️ Secure File Infrastructure  
✔️ Intelligence-Grade UI System  

---

## 👩‍💻 Author

**Sharon T Kuriyakose**  
Full-Stack Developer  

---

> 🛡️ CyberSecure-Hub — Where Privacy Meets Precision.