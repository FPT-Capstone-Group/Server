const crypto = require('crypto')

const accountSid = "AC36c209b26995cbc64fff400848814b51";
const authToken = "e7d8c820421016a66f2cf645538f36b6";
const verifySid = "VA0135daca0617c30a10b1186cd1cae41e";
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


