import * as OTPAuth from "otpauth"
import pkg from "hi-base32"
import crypto from "crypto"
import twilio from 'twilio'
import otpGenerator from 'otp-generator'

const { encode } = pkg
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const authenticateToken = async (req, reply, done) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  console.log("auth token", token)
  console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET)
  if (!token) return reply.code(401).send({ error: "No token provided" })

  try {
    const user = await req.server.jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = user;
  } catch (err) {
    return reply.code(403).send({ error: 'Unauthorized' });
  }
}

function generateAccessToken(req, user) {
  return req.server.jwt.sign(user, { expiresIn: '1h' })
}

const generateRandomBase32 = () => {
  const buffer = crypto.randomBytes(15);
  const base32 = encode(buffer).replace(/=/g, "").substring(0, 24);
  return base32;
}

async function twoFactorAuthSms (req, reply, user) {
 
  try {
    const message = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications
      .create({
        to: user.number,
        channel: 'sms'
      })
      return reply.send({ success: true, status: message.status })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

function twoFactorAuthEmail(req, reply, user) {
  let { nodeMailer } = req.server.nodeMailer
  const recipient = user.email
  const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false })
  
  try {
    const putStatement = req.server.db.prepare('INSERT INTO otp_codes (otp_code, user_id, expires_at) VALUES(?, ?, ?)')
    putStatement.run(otp, user.id, DATETIME('now', '+1 minutes'))
    
    nodeMailer.sendMail({
      from: 'info@transendence.com',
      to: recipient,
      subject: 'Two-Factor Authentication code',
      text: otp
    }, (error, info) => {
      if (error) return reply.code(404).send({ error: error.message })
      
      return reply.send({ messageId: info.messageId })
    })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const twoFactorAuthApp = async function(req, reply, user) {
  try {
    const base32_secret = generateRandomBase32()

    const putStatement = req.server.db.prepare('INSERT INTO otp_codes (otp_secret, user_id, expires_at) VALUES(?, ?, ?)')
    putStatement.run(base32_secret, user.id, DATETIME('now', '+1 minutes'))
  
    let totp = OTPAuth.TOTP({
      issuer: "Transendence",
      label: "Transendence",
      algorithm: "SHA1",
      digits: 6,
      secret: base32_secret,
    })
    let otpAuthUrl = totp.toString()

    return reply.send({ secret: base32_secret, auth_url: otpAuthUrl })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

async function verifyAppOtp(req, reply, user) {
  const { otp } = req.body;

  try {
    const otpRecord = req.server.db.prepare('SELECT otp_secret FROM otp_codes WHERE user_id = ? AND expires_at > DATETIME("now")').get(user.id);

    if (otpRecord) {
      let totp = OTPAuth.TOTP({
        issuer: "Transendence",
        label: "Transendence",
        algorithm: "SHA1",
        digits: 6,
        secret: otpRecord.otp_secret,
      })

      if (totp.validate({ token: otp })) 
        return true
      else 
        return false
    } else {
      return false
    }
  } catch (error) {
    return reply.code(500).send({ error: error.message });
  }
}

async function verifyEmailOtp(req, reply, user) {
  const { otp } = req.body;

  try {
    const otpRecord = req.server.db.prepare('SELECT * FROM otp_codes WHERE otp_code = ? AND user_id = ? AND expires_at > DATETIME("now")').get(otp, user.id);

    if (otpRecord)
      return true
    else
      return false
  } catch (error) {
    return reply.code(500).send({ error: error.message });
  }
}


async function verifySmsOtp(req, reply, user) {
  const { otp } = req.body;

  try {
    const verificationCheck = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks
      .create({
        to: user.number,
        code: otp
      });

    if (verificationCheck.status === 'approved')
      return true
    else
      return false
  } catch (error) {
    return reply.code(500).send({ error: error.message });
  }
}

export { 
  authenticateToken,
  generateAccessToken,
  twoFactorAuthApp,
  twoFactorAuthEmail,
  twoFactorAuthSms,
  verifyAppOtp,
  verifyEmailOtp,
  verifySmsOtp
}