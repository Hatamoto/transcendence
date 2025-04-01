import { generateAccessToken } from '../middleware/authentication.js'
import bcrypt from 'bcrypt'
import { 
  twoFactorAuthApp,
  twoFactorAuthEmail, 
  twoFactorAuthSms,
  verifyAppOtp,
  verifyEmailOtp,
  verifySmsOtp
 } from '../middleware/authentication.js'

const completeLogin = async function(req, reply, user) {
  try {
    const accessToken = generateAccessToken(req, { id: user.id, name: user.name })
    const refreshToken = req.server.jwt.sign({ id: user.id, name: user.name }, process.env.REFRESH_TOKEN_SECRET)
  
    const updateStatement = req.server.db.prepare('UPDATE users SET status = 1 WHERE name = ?')
    updateStatement.run(user.name)
  
    const insertStatement = req.server.db.prepare('INSERT INTO refresh_tokens (user_id, refresh_token) VALUES (?, ?)')
    insertStatement.run(user.id, refreshToken)
  
    return reply.send({ accessToken: accessToken, refreshToken: refreshToken })
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: error.message})
  }
}

const logoutUser = async function(req, reply) {
  const { token } = req.body
  console.log("req body: ", req.body)
  console.log("refresh token: ", token)

  try{
    const userId = req.server.db.prepare('SELECT user_id FROM refresh_tokens WHERE refresh_token = ?').get(token)

    if (!userId) return reply.code(404).send({ error: "Refresh token not found"})
    const deleteStatement = req.server.db.prepare('DELETE FROM refresh_tokens WHERE refresh_token = ?')
    deleteStatement.run(token)
  
    console.log("user id ", userId )
    const updateStatement = req.server.db.prepare('UPDATE users SET status = 0 WHERE id = ?')
    updateStatement.run(userId.user_id)
  
    return reply.code(204).redirect('/')
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: error.message })
  }
}

const loginUser = async function (req, reply) {
  const { username, password } = req.body

  console.log(`username: ${username} , password: ${password}`)
  try {
    const user = req.server.db.prepare('SELECT * FROM users WHERE name = ?').get(username)
    if (!user) return reply.code(401).send({ error: 'Incorrect username or password' })
    
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return reply.code(401).send({ error: 'Incorrect username or password' })
    
    if (user.two_fa_enabled === 1) {
      const tempToken = req.server.jwt.sign({ id: user.id }, process.env.TEMP_SECRET, { expiresIn: '5m' })

      console.log("temp token: ", tempToken)
      const insertTempStatement = req.server.db.prepare(`INSERT INTO pending_logins (user_id, temp_token) VALUES (?, ?)`)

      insertTempStatement.run(user.id, tempToken)

      let messageId

      if (user.two_fa_method === 'sms')
        messageId = await twoFactorAuthSms(req, reply, user)
      else if (user.two_fa_method === 'email') 
        messageId = twoFactorAuthEmail(req, reply, user)
      else if(user.two_fa_method === 'auth_app')
        messageId = twoFactorAuthApp(req, reply, user)
      else return reply.code(401).send({ error: 'Two-Factor Authentication is enabled, but no method was found' })
      
      return reply.send({ temp_token: tempToken, message: '2FA code sent. Verify to continue.', messageId })
    }
    
    return completeLogin(req, reply, user)
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: error.message })
  }
}

const getToken = async function(req, reply) {
  const refreshToken = req.body.token

  if (!refreshToken) return reply.code(401).send({ error: "No refresh token provided "})
  
  const getStatement = req.server.db.prepare('SELECT * FROM refresh_tokens WHERE refresh_token = ? AND user_id = ?')
  const token = getStatement.get(refreshToken, req.user.id)

  if (!token) return reply.code(403).send({ error: "Invalid refresh token" })

  try {
    const user = await req.server.jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(req, { id: user.id, name: user.name });
    
    return reply.send({ accessToken });
  } catch (error) {
    console.log(error)
    return reply.code(403).send({ error: "Invalid or expired refresh token" });
  }
}

const verifyOtp = async function(req, reply) {
  const { temp_token } = req.body

  try {
    const decoded = req.server.jwt.verify(temp_token, process.env.TEMP_SECRET)
    if (!decoded || !decoded.id) return reply.code(401).send({ error: "Invalid or expired token" })
    
    const tempLogin = req.server.db.prepare('SELECT * FROM pending_logins WHERE temp_token = ?').get(temp_token)
    if (!tempLogin) return reply.code(401).send({ error: "Invalid session" })

    const user = req.server.db.prepare('SELECT * FROM users WHERE id = ?').get(tempLogin.user_id)
    if (!user) return reply.status(404).send({ error: 'User not found' })
  
    const otp_type = user.two_fa_method

    let otpValid = false

    if (otp_type === 'sms') otpValid = await verifySmsOtp(req, reply, user)
    else if (otp_type === 'email') otpValid = await verifyEmailOtp(req, reply, user)
    else if (otp_type === 'auth_app') otpValid = await verifyAppOtp(req, reply, user)

    if (!isValidOtp) return reply.code(401).send({ error: "Invalid OTP" })

    req.server.db.prepare('DELETE FROM pending_logins WHERE temp_token = ?').run(temp_token)

    return completeLogin(req, reply, user)
  } catch (error) {
      console.log(error)
      return reply.code(500).send({ error: error.message })
  }
}

export { loginUser, logoutUser, getToken, verifyOtp }