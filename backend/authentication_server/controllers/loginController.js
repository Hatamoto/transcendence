import bcrypt from 'bcrypt'
import axios from 'axios'
import { verifyIdToken, completeLogin, completeGoogleLogin } from '../services/authenticationServices.js'

const logoutUser = async function(req, reply) {
  const { token } = req.body

  try{
    const userId = req.server.db.prepare('SELECT user_id FROM refresh_tokens WHERE refresh_token = ?').get(token)

    if (!userId) return reply.code(404).send({ error: "Refresh token not found"})
    const deleteStatement = req.server.db.prepare('DELETE FROM refresh_tokens WHERE refresh_token = ?')
    deleteStatement.run(token)

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

  try {
    const user = req.server.db.prepare('SELECT * FROM users WHERE name = ?').get(username)
    if (!user) return reply.code(401).send({ error: 'Incorrect username or password' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return reply.code(401).send({ error: 'Incorrect username or password' })
    
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

const googleAuthHandler = async function(req, reply) {
  const { code } = req.query

  if(!code) return reply.code(400).send({ error: 'Authorization code is required' })

  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code',
    })

    const { id_token } = data
    const profile =  await verifyIdToken(id_token)
    let user

    try {
      user = await req.server.db.prepare('SELECT id, name FROM users WHERE google_id = ?').get(profile.sub)

      if(!user) {
        const avatar = process.env.DEFAULT_AVATAR
        
        const insertStatement = req.server.db.prepare('INSERT INTO users (email, name, google_id, avatar) VALUES (?, ?, ?, ?)')
        insertStatement.run(profile.email, profile.name, profile.sub, avatar)
    
        const newUser = await req.server.db.prepare('SELECT id, name FROM users WHERE google_id = ?').get(profile.sub)

        return completeGoogleLogin(req, reply, newUser)
      } 
    } catch (dbError) {
      console.error('Error with database', dbError)
      return reply.code(500).send({ error: dbError.message })
    }

    return completeGoogleLogin(req, reply, user)
  } catch (error) {
    console.error("Google Auth Error:", error.response?.data || error.message)
    if (error.response) {
      if (error.response.status === 400) {
        return reply.code(400).send({ error: 'Invalid request to Google API' })
      }
      if (error.response.status === 401) {
        return reply.code(401).send({ error: 'Invalid or expired Google authentication token' })
      }
    }

    if (error.message && error.message === 'Email is not verified by Google') {
      return reply.code(400).send({ error: 'Email not verified by Google. Please verify your email.' })
    }
  
    return reply.code(500).send({ error: error.message })
  }
}

export { loginUser, logoutUser, getToken, googleAuthHandler }