import { 
  getUserOpts, 
  getUsersOpts, 
  addUserOpts, 
  deleteUserOpts, 
  updateUserOpts, 
  updatePasswordOpts,
  dashboardOpts,
  userLogoutOpts,
  uploadOpts,
  gameroomOpts,
  gameOpts
} from '../schemas/userSchemas.js'
import { loginOpts, logoutOpts, tokenOpts, otpVerifyOpts } from '../schemas/loginSchemas.js'
import friendRequestOpts from '../schemas/friendSchemas.js'

async function root (fastify, options) {
  fastify.get('/', async (req, reply) => {
    try {
		return reply.sendFile('index.html');
    } catch (error) {
      console.log(error)
    }
  })
}

async function userRoutes (fastify, options) {
  fastify.get('/api/users', getUsersOpts)
  fastify.get('/api/users/:id', getUserOpts)
  fastify.get('/api/logout', userLogoutOpts)
  fastify.post('/api/users', addUserOpts)
  fastify.post('/api/login', loginUserOpts)
  fastify.put('/api/upload', uploadOpts)
  fastify.put('/api/users/:id', updateUserOpts)
  fastify.put('/api/users/pwd/:id', updatePasswordOpts)
  fastify.delete('/api/users/:id', deleteUserOpts)
  fastify.get('/api/dashboard', dashboardOpts)
  fastify.get('/api/gameroom', gameroomOpts)
  fastify.get('/api/game', gameOpts)
}

async function loginRoutes (fastify, options) {
  fastify.post('/api/login', loginOpts) //Vaatii request bodyssa: username, password. Palauttaa refresh ja authenticate JWT tokenit
  fastify.post('/api/token', tokenOpts) //Vaatii request bodyssa JWT refresh tokenin
  fastify.post('/api/verify/otp', otpVerifyOpts)
  fastify.delete('/api/logout', logoutOpts) //Vaatii request bodyssa JWT refresh tokenin. Poistaa Userin tokenit asettaa statuksen 0 (offline) ja redirectaa etusivulle
}

async function friendRoutes (fastify, options) {
  fastify.post('/api/friend/request', friendRequestOpts) //Vaatii request bodyssa friendId joka on sen käyttäjän id joka halutaan lisätä kaveriksi
}

export { root, userRoutes, loginRoutes, friendRoutes }