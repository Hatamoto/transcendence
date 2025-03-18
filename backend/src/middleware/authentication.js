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
  