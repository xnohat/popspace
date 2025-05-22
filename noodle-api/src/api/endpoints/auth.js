const { shared } = require("../../lib/_lib");
const http = require("../http");

class Auth {
  constructor(zoo) {
    this.zoo = zoo;
    this.initPost();
  }

  initPost() {
    // Endpoint to validate credentials
    this.zoo.loggedOutPostEndpoint("/auth/validate", async (req, res, params) => {
      const { username, password } = req.body;
      
      // Get credentials from environment variables
      const expectedUsername = process.env.REACT_APP_AUTH_USER;
      const expectedPassword = process.env.REACT_APP_AUTH_PASSWORD;
      
      // Skip authentication if credentials are not set
      if (!expectedUsername || !expectedPassword) {
        return http.succeed(req, res, { 
          authenticated: true,
          message: "Authentication bypassed - no credentials configured" 
        });
      }
      
      // Validate credentials
      if (username === expectedUsername && password === expectedPassword) {
        return http.succeed(req, res, { 
          authenticated: true,
          message: "Authentication successful" 
        });
      } else {
        // Create an error object with the message
        const error = new Error("Invalid credentials");
        return http.fail(req, res, error, 401);
      }
    });
  }
}

module.exports = Auth;
