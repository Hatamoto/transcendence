<<<<<<< HEAD
// Standard JWT function
const authenticate = async (req, reply) => {
	try {
	  await req.server.jwtVerify();
	} catch (error) {
	  console.error("JWT Verification Error (authenticate):", error.message);
	  return reply.code(403).send({ error: 'Unauthorized' });
	}
  };
  
  // If we want to make sure we dont use a ready package for a function
  const authenticateToken = async (req, reply, next) => {
	try {
	  //console.log("Incoming Headers:", req.headers);
  
	  // Extract token from BOTH Cookie and Authorization header
	  const token = req.cookies.accessToken || 
					(req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);
	  if (!token) {
		console.error("No Token Found in Headers or Cookies");
		return reply.code(401).send({ error: 'Missing token' });
	  }
	  //console.log("Token Extracted:", token);
	  req.server.jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) {
		  console.error("JWT Verification Error:", err.message);
		  return reply.code(403).send({ error: 'Unauthorized' });
		}
		//console.log("Verified User Data:", user);
		req.user = user;
		next();
	  });
	} catch (error) {
	  console.error("Unexpected Error in `authenticateToken`:", error.message);
	  return reply.code(500).send({ error: 'Server Error' });
	}
  };
  export default authenticateToken;
  
=======
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

  if (!token) return reply.code(401).send({ error: "No token provided" })

  try {
    const user = await req.server.jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = user;
  } catch (error) {
    console.log(error)
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
      resolve({ success: true, status: message.status })
  } catch (error) {
    console.log(error)
    reject(error)
    //return reply.code(500).send({ error: error.message })
  }
}

function twoFactorAuthEmail(req, reply, user) {
  return new Promise((resolve, reject) => {
    const recipient = user.email
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false })
    
    // try {
    //   const putStatement = req.server.db.prepare('INSERT INTO otp_codes (otp_code, user_id, expires_at) VALUES(?, ?, ?)')
    //   putStatement.run(otp, user.id, strftime('%Y-%m-%d %H:%M:%S', 'now', '+1 minutes'))
      
    //   nodeMailer.sendMail({
    //     from: 'info@transendence.com',
    //     to: recipient,
    //     subject: 'Two-Factor Authentication code',
    //     text: otp
    //   }, (error, info) => {
    //     if (error) return reply.code(404).send({ error: error.message })
        
    //     return reply.send({ messageId: info.messageId })
    //   })
    // } catch (error) {
    //   console.log(error)
    //   return reply.code(500).send({ error: error.message })
    // }
  
    try {
      const putStatement = req.server.db.prepare(
        'INSERT INTO otp_codes (otp_code, user_id, expires_at) VALUES(?, ?, datetime(\'now\', \'+1 minutes\'))'
      )
      putStatement.run(otp, user.id)
      
      if (!req.server.nodeMailer) {
        return reject(new Error('Nodemailer is not initialized'));
      }

      req.server.nodeMailer.sendMail(
        {
          from: 'info@transendence.com',
          to: recipient,
          subject: 'Two-Factor Authentication code',
          text: otp
        },
        (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info.messageId);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  })
}

const twoFactorAuthApp = async function(req, reply, user) {
  try {
    const base32_secret = generateRandomBase32()

    const putStatement = req.server.db.prepare('INSERT INTO otp_codes (otp_secret, user_id, expires_at) VALUES(?, ?, strftime("%Y-%m-%d %H:%M:%S", "now", "+1 minutes"))')
    putStatement.run(base32_secret, user.id)
  
    let totp = OTPAuth.TOTP({
      issuer: "Transendence",
      label: "Transendence",
      algorithm: "SHA1",
      digits: 6,
      secret: base32_secret,
    })
    let otpAuthUrl = totp.toString()

    resolve({ secret: base32_secret, auth_url: otpAuthUrl })
  } catch (error) {
    console.log(error)
    reject(error)
    //return reply.code(500).send({ error: error.message })
  }
}

async function verifyAppOtp(req, reply, user) {
  const { otp } = req.body;

  try {
    const otpRecord = req.server.db.prepare('SELECT otp_secret FROM otp_codes WHERE user_id = ? AND expires_at > CURRENT_TIMESTAMP').get(user.id);

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
    console.log(error)
    return reply.code(500).send({ error: error.message });
  }
}

async function verifyEmailOtp(req, reply, user) {
  const { otp } = req.body;

  try {
    const otpRecord = req.server.db.prepare('SELECT * FROM otp_codes WHERE otp_code = ? AND user_id = ? AND expires_at > CURRENT_TIMESTAMP').get(otp, user.id);

    if (otpRecord)
      return true
    else
      return false
  } catch (error) {
    console.log(error)
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
    console.log(error)
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
>>>>>>> origin/Latest-backend-version
