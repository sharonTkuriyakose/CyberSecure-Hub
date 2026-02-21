const Mailjet = require('node-mailjet');

/**
 * PRODUCTION READY: Mailjet Transactional Email Utility
 * Verified for account: rdxsharon10@gmail.com
 */

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

const sendEmail = async (options) => {
  try {
    // Determine if this is a recovery or standard login attempt
    const isRecovery = options.subject.toLowerCase().includes('recovery');

    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "rdxsharon10@gmail.com", 
            Name: "CyberSecure-Hub"
          },
          To: [
            {
              Email: options.email,
              Name: "Operative"
            }
          ],
          Subject: options.subject,
          HTMLPart: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617; color: white; padding: 40px; border-radius: 12px; border: 1px solid #38bdf8; text-align: center;">
              <h2 style="color: #38bdf8; margin-top: 0; text-transform: uppercase; letter-spacing: 2px;">
                ${isRecovery ? "Access Recovery Protocol" : "Identity Verification"}
              </h2>
              <p style="color: #94a3b8; font-size: 1.1rem;">
                ${isRecovery ? "A security reset has been initiated for your profile." : "A secure login attempt was detected for your vault."}
              </p>
              <div style="background: #0f172a; padding: 25px; border-radius: 10px; border: 1px dashed #38bdf8; margin: 30px 0;">
                 <p style="margin: 0; color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Your 6-Digit Access Key</p>
                 <h1 style="color: #38bdf8; font-size: 3.5rem; letter-spacing: 15px; margin: 10px 0;">${options.otp}</h1>
              </div>
              <p style="color: #ef4444; font-size: 0.85rem; font-weight: bold;">
                CRITICAL: This key expires in 10 minutes. Do not share this with anyone.
              </p>
              <hr style="border: 0; border-top: 1px solid #1e293b; margin: 30px 0;">
              <p style="color: #475569; font-size: 0.75rem;">
                Sent via CyberSecure-Hub Protection Layer | Secured by Mailjet
              </p>
            </div>`
        }
      ]
    });

    const result = await request;

    console.log("-----------------------------------------");
    console.log("✅ MAILJET OTP DELIVERED TO: " + options.email);
    console.log("Status: " + result.body.Messages[0].Status);
    console.log("-----------------------------------------");

    return result.body;
  } catch (error) {
    // 🔍 CRITICAL LOGGING: Check your terminal for these error codes
    console.error("❌ Mailjet Transmission Failure:");
    console.error("Status Code:", error.statusCode || "N/A");
    console.error("ErrorMessage:", error.message || "Unknown error");
    
    // If the error comes from Mailjet API, log the detailed response
    if (error.response && error.response.body) {
      console.error("Mailjet Details:", JSON.stringify(error.response.body, null, 2));
    }
    
    throw error;
  }
};

module.exports = sendEmail;