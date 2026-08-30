module.exports = (req, res) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const host = req.headers.host;
  const protocol = host && host.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/callback`;
  const scope = (req.query && req.query.scope) || "repo,user";
  const authUrl =
    `https://github.com/login/oauth/authorize?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}`;
  res.writeHead(302, { Location: authUrl });
  res.end();
};
