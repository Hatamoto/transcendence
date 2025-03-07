

import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import OAuth2, {OAuth2Namespace} from "@fastify/oauth2";

// Register a GoogleOAuth2 namespace globally in the fastify instance
declare module 'fastify' {
    interface FastifyInstance {
        GoogleOAuth2: OAuth2Namespace;
    }
}

// Google OAuth2 Options
const googleOAuth2Options = {
    // Namespace
    name: 'GoogleOAuth2',
    // Scopes
    scope: ['profile', 'email'],
    credentials: {
        client: {
            // Put in your client id here
            id: "",
            // Put in your client secret here
            secret: ""
        },
        // @fastify/oauth2 google provider
        auth: OAuth2.GOOGLE_CONFIGURATION
    },
    // This option will create a new root with the GET method to log in through Google.
    // Make sure you don't have any other routes in this path with the GET method.
    startRedirectPath: '/oauth2/google',
    // Here you specify the Google callback route.
    // All logics will be checked after the success login or failure login in this path.
    callbackUri: `http://localhost:8000/oauth2/google/callback`,
    // The following 2 functions are check in detail whether the input parameters from Google include the state query parameter or not
};

export function registerGoogleOAuth2Provider(app: FastifyInstance) {
    app.register(OAuth2, googleOAuth2Options)
}


