import fetch from 'node-fetch';

const GOOGLE_TOKEN_INFO = 'https://oauth2.googleapis.com/tokeninfo?id_token=';

export async function verifyGoogleIdToken(idToken, expectedClientId) {
  const res = await fetch(GOOGLE_TOKEN_INFO + idToken);
  if (!res.ok) throw new Error('Google token verify failed');
  const data = await res.json();
  if (expectedClientId && data.aud !== expectedClientId) {
    throw new Error('Invalid Google client id');
  }
  // data.sub = unique user id
  return {
    sub: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
    emailVerified: data.email_verified === 'true' || data.email_verified === true
  };
}
