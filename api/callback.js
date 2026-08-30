module.exports = async (req, res) => {
  const code = req.query && req.query.code;
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!code) {
    res.status(400).send("Missing OAuth code from GitHub.");
    return;
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });
    const data = await tokenRes.json();

    if (data.error) {
      res.status(400).send(`Authentication error: ${data.error_description || data.error}`);
      return;
    }

    const content = JSON.stringify({ token: data.access_token, provider: "github" });
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <script>
        (function() {
          function receiveMessage(e) {
            window.opener.postMessage(
              'authorization:github:success:${content}',
              e.origin
            );
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })();
      </script>
    `);
  } catch (err) {
    res.status(500).send("Authentication error: " + err.message);
  }
};
