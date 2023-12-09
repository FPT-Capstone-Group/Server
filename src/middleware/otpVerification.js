const crypto = require('crypto')

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;
const client = require("twilio")(accountSid, authToken);

const enableOtp = process.env.ENABLE_OTP

const getOtpToken = async (username) => {
    if (enableOtp){
        return "pending"
    }
    const phoneNumber = '+84' + username.slice(1);

    console.log("Start sending OTP")
      const verification = await client.verify.v2
        .services(verifySid)
        .verifications.create({to: phoneNumber, channel: "sms"})
    console.log(verification.status)
    return verification.status
};

const verifyOtpToken = async (username, otpToken) => {
    if (enableOtp){
        return "approved"
    }
    const phoneNumber = '+84' + username.slice(1);
    console.log("Start checking OTP")
    const verification_check = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: phoneNumber, code: otpToken });
    console.log(verification_check.status)
    return verification_check.status;
};

module.exports = {
    getOtpToken,
    verifyOtpToken
};


