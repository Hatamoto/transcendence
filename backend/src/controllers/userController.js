import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
import path from 'path'

const getUsers = async function (req, reply) {
  try {
    const users = req.server.db.prepare("SELECT * FROM users").all();

    if (users.length === 0) {
      return reply.code(404).send({ error: "No users found" })
    }
    return reply.send(users)
  } catch (error) {
      return reply.code(500).send({ error: error.message })
  }
}

const addUser = async function (req, reply) {
  const { name, email, password } = req.body
  const avatar = process.env.DEFAULT_AVATAR
  let hashedPassword = password
  const passwordPattern = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:'",.<>?])/
  
  if (!passwordPattern.test(password)) {
    return reply.code(400).send({ error: 'Password must contain at least one digit, one letter, and one special character.' })
  }

  if (password) {
    const salt = await bcrypt.genSalt(10)
    hashedPassword = await bcrypt.hash(password, salt)
  }

  const user = {
   id: uuidv4(),
   name,
   email,
   avatar
  }

  try {
    const insertStatement = req.server.db.prepare('INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)')
    insertStatement.run(name, email, hashedPassword, avatar)

    return reply.code(201).send(user)
  } catch (error) {
    console.log(error)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return reply.code(409).send({ error: "Username or email already in use" })
    } else {
      return reply.code(500).send({ error: error.message })
    }
  }
}

const getUser = async function (req, reply) {
  const { id } = req.params

  try {
    const getStatement = req.server.db.prepare('SELECT * FROM users WHERE id = ?')
    const user = getStatement.get(id)

    if (!user) {
      return reply.code(404).send({ error: "User not found" })
    }

    return reply.send(user)
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const deleteUser = async function (req, reply) {
  const {id} = req.params

  try {
    const deleteStatement = req.server.db.prepare('DELETE FROM users WHERE id = ?')
    deleteStatement.run(id)
    
    return reply.send({message: `User ${id} has been removed`})
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const updateUser = async function (req, reply) {
  const {id} = req.params
  const { name, email } = req.body
  
  try {
    const getStatement = req.server.db.prepare('SELECT * FROM users WHERE id = ?')
    const user = getStatement.get(id)
    if (!user) {
      return reply.code(404).send({ error: 'User not found' })
    }

    const updateStatement = req.server.db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?')
    updateStatement.run(name, email, id)
    return reply.send({
      id,
      name,
      email
    })
  } catch (error) {
      return reply.code(500).send({ error: error.message })
  }
}

const updatePassword = async function (req, reply) {
  const {id} = req.params
  const { password } = req.body
  
  const passwordPattern = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:'",.<>?])/
  if (!passwordPattern.test(password)) {
    return reply.code(400).send({ error: 'Password must contain at least one digit, one letter, and one special character.' })
  }

  try {
    const getStatement = req.server.db.prepare('SELECT * FROM users WHERE id = ?')
    const user = getStatement.get(id)
    if (!user) {
      return reply.code(404).send({ error: 'User not found' })
    }

    let hashedPassword = password

    if (password) {
      const salt = await bcrypt.genSalt(10)
      hashedPassword = await bcrypt.hash(password, salt)
    }

    const updateStatement = req.server.db.prepare('UPDATE users SET password = ? WHERE id = ?')
    updateStatement.run(hashedPassword, id)
   
    return reply.send({ message: `Password was changed for user ${id}` })
  } catch (error) {
      if (error.code === 'FST_ERR_VALIDATION') {
        return reply.code(400).send({ error: 'Minimum length for password is 8 and it has to contain atleast 1 digit and 1 special character' })
      } else {
        return reply.code(500).send({ error: error.message })
      }
    }
}

const getDashboard = async function(req, reply) {
  try {
    const username = req.user.name
    return reply.view('../public/dashboard.ejs', { username })
  } catch (error) {
    console.log(error)
  }
}

const uploadAvatar = async function(req, reply) {
  try {
    const username = req.user.name
    const avatar = await req.file()
    const pump = util.promisify(pipeline)
    const uploadDir = path.join(__dirname, '../avatars')
    const filePath = path.join(uploadDir, avatar.filename)
    
    await pump(avatar.file, fs.createWriteStream(filePath))

    const avatarPath = `/avatars/${avatar.filename}`
    const updateStatement = req.server.db.prepare('UPDATE users SET avatar = ? WHERE name = ?')
    updateStatement.run(avatarPath, username)
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

export { 
  getUser,
  addUser,
  getUsers,
  deleteUser,
  updateUser,
  updatePassword,
  getDashboard,
  uploadAvatar
}