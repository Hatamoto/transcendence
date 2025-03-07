

import fastify from 'fastify';

// Import Providers
import {registerCorsProvider} from "./cors";
import {registerGoogleOAuth2Provider} from "./oauth2";

// Import Google OAuth2 Routes
import {googleOAuth2Routes} from "./google.route";

export async function createServer() {
    // Creating a new fastify instance
    const app = fastify();

    // Register the CORS provider
    registerCorsProvider(app);

    // Register the Google OAuth2 provider & routes
    registerGoogleOAuth2Provider(app);
    app.register(googleOAuth2Routes, { prefix: '/oauth2' });

    return app;
}