import { 
  getUserOpts, 
  getUsersOpts, 
  addUserOpts, 
  deleteUserOpts, 
  updateUserOpts, 
  updatePasswordOpts,
  dashboardOpts,
  uploadOpts,
  tfaEnableOpts,
  tfaDisableOpts,
} from '../schemas/userSchemas.js'
import { loginOpts, logoutOpts, tokenOpts, otpVerifyOpts } from '../schemas/loginSchemas.js'
import friendRequestOpts from '../schemas/friendSchemas.js'

async function root (fastify, options) {
  fastify.get('/', async (req, reply) => {
    try {
      return reply.view('../public/index.ejs')
    } catch (error) {
      console.log(error)
    }
  })
}

async function userRoutes (fastify, options) {
  fastify.get('/api/users', getUsersOpts) //Palauttaa User objektin joka käyttäjälle mikä sisältää: id, name, status(1 = online, 0 = offline), wins, losses, path avatariin
  fastify.get('/api/user/:id', getUserOpts) //Vaatii parametrina ID:n ja palauttaa User objektin id:n perusteella
  fastify.get('/api/dashboard', dashboardOpts) //mahdollista käyttää myöhemmin esim profiili sivuna, redirectaa käyttäjän loginin jälkeen
  fastify.put('/api/upload', uploadOpts) //Avatarin uploadaamiseen, ottaa kuva tiedoston ja tallentaa kuvan avatars kansioon ja pathin databaseen
  fastify.put('/api/user/:id', updateUserOpts) //Vaatii parametrina ID:n ja request bodyssa: name, email, number, password 
  fastify.put('/api/user/pwd/:id', updatePasswordOpts) //Vaatii Parametrina ID:n ja request bodyssa password
  fastify.delete('/api/user/:id', deleteUserOpts) //Vaatii parametrina ID:n ja poistaa kyseisen Userin
  fastify.post('/api/user', addUserOpts) //Vaatii request bodyssa: name, email, number, password
  fastify.post('/api/2fa/enable', tfaEnableOpts) //Vaatii request bodyssa: method (sms, email tai auth_app)
  fastify.post('/api/2fa/disable', tfaDisableOpts) //Poistaa 2FA:n käytöstä eii vaadi mitään
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