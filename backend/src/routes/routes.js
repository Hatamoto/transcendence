import { getExternalIP } from '../utils/externalIp.js';

import { 
  getUserOpts, 
  getUsersOpts, 
  addUserOpts, 
  deleteUserOpts, 
  updateUserOpts, 
  updatePasswordOpts,
  dashboardOpts,
  uploadOpts,
} from '../schemas/userSchemas.js'
import { 
  loginOpts,
  logoutOpts, 
  tokenOpts, 
  googleAuthOpts 
} from '../schemas/loginSchemas.js'
import { 
  friendRequestOpts, 
  checkPendingOpts, 
  acceptRequestOpts,
  blockRequestOpts,
  getFriendsOpts
} from '../schemas/friendSchemas.js'

let cachedIP = null;

async function root (fastify, options) {
  fastify.get('/', async (req, reply) => {
    try {
      return reply.view('../public/index.ejs')
    } catch (error) {
      console.log(error)
	  reply.code(500).send('Internal Server Error');
    }
	});

	fastify.get('/external-ip', async (request, reply) => {
		if (cachedIP) return reply.send({ ip: cachedIP });
	
		try {
			cachedIP = await getExternalIP();
			reply.send({ ip: cachedIP });
		} catch (err) {
			reply.code(500).send({ error: 'Failed to get IP' });
		}
	});
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
}

async function loginRoutes (fastify, options) {
  fastify.post('/api/login', loginOpts) //Vaatii request bodyssa: username, password. Palauttaa refresh ja authenticate JWT tokenit
  fastify.post('/api/token', tokenOpts) //Vaatii request bodyssa JWT refresh tokenin
  fastify.delete('/api/logout', logoutOpts) //Vaatii request bodyssa JWT refresh tokenin. Poistaa Userin tokenit asettaa statuksen 0 (offline) ja redirectaa etusivulle
  fastify.get('/api/googleauth/callback', googleAuthOpts)
  fastify.get('/api/googleauth', async (req, reply) => {
    const CLIENT_ID = process.env.CLIENT_ID
    const REDIRECT_URI = process.env.REDIRECT_URI
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile%20email`

    return reply.redirect(url)
  })
}

async function friendRoutes (fastify, options) {
  fastify.get('/api/friends', getFriendsOpts)
  fastify.get('/api/friend/check_pending', checkPendingOpts)
  fastify.post('/api/friend/request', friendRequestOpts) //Vaatii request bodyssa friendId joka on sen käyttäjän id joka halutaan lisätä kaveriksi
  fastify.post('/api/friend/accept', acceptRequestOpts)
  fastify.post('/api/friend/block', blockRequestOpts)

}
export { root, userRoutes, loginRoutes, friendRoutes }