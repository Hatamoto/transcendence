import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

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
  let hashedPassword = password

  if (password) {
    const salt = await bcrypt.genSalt(10)
    hashedPassword = await bcrypt.hash(password, salt)
  }
  const user = {
   id: uuidv4(),
   name,
   email
  }

  try {
    const insertStatement = req.server.db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")
    insertStatement.run(name, email, hashedPassword)
    
    return reply.code(201).send(user)
  } catch (error) {
    console.log(error)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return reply.code(409).send({ error: "Username already in use" })
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
      return reply.code(500).send({ error: error.message })
  }
}

const loginUser = async function (req, reply) {
  const { username, password } = req.body

  try {
    const getStatement = req.server.db.prepare('SELECT * FROM users WHERE name = ?')
    const user = getStatement.get(username)

    if (!user) {
      return reply.code(401).send({ error: 'Incorrect username or password' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return reply.code(401).send({ error: 'Incorrect username or password' })
    }

    req.session.user = username
    console.log(`Session set for user: ${req.session.user}`)  // Log here to check the session
    console.log('Session:', req.session)
    return reply.redirect('/api/dashboard')
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
  loginUser
}