const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');

const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

// extract and return the Bearer Token from the Lambda event parameters
const getToken = (params) => {
    if (!params.type || params.type !== 'TOKEN') {
        throw new Error('Expected "event.type" parameter to have value "TOKEN"');
    }

    const tokenString = params.authorizationToken;
    if (!tokenString) {
        throw new Error('Expected "event.authorizationToken" parameter to be set');
    }

    const match = tokenString.match(/^Bearer (.*)$/);
    if (!match || match.length < 2) {
        throw new Error(`Invalid Authorization token - ${tokenString} does not match "Bearer .*"`);
    }
    return match[1];
}

const jwtOptions = {
  audience: process.env.AUDIENCE,
  issuer: process.env.TOKEN_ISSUER
};

const auth = (event, callback, requiredPermission) => {
  const token = getToken(event);
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
      throw new Error('Invalid token');
  }

  if (requiredPermission && decoded.payload && decoded.payload.permissions && decoded.payload.permissions.indexOf(requiredPermission) === -1) {
    callback('User is not authorized to use this api');
    return;
  }

  client.getSigningKey(decoded.header.kid, (err, key) => {
    if (err) {
      return callback(err)
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    const decoded = jwt.verify(token, signingKey, jwtOptions);
    callback(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
  })
}

module.exports.authAddGame = (event, context, callback) => {
  auth(event, callback, "add:game")
}

module.exports.authAddPlayer = (event, context, callback) => {
  auth(event, callback, "add:player")
}

module.exports.authAddTournament = (event, context, callback) => {
  auth(event, callback, "add:tournament")
}

module.exports.authDeleteGame = (event, context, callback) => {
  auth(event, callback, "delete:game")
}

const client = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: process.env.JWKS_URI
});