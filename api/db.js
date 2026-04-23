module.exports = async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: "Server env vars missing: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" });
    }

    const path = req.query.path;
    if (!path || typeof path !== "string") {
      return res.status(400).json({ error: "Missing query param: path" });
    }

    const method = req.method || "GET";
    const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}`;
    const fetchRes = await fetch(endpoint, {
      method,
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: method === "GET" || method === "HEAD" ? undefined : JSON.stringify(req.body || {}),
    });

    const text = await fetchRes.text();
    if (!fetchRes.ok) {
      return res.status(fetchRes.status).send(text || "Upstream request failed");
    }

    if (!text) {
      return res.status(200).json([]);
    }

    try {
      return res.status(200).json(JSON.parse(text));
    } catch (_parseErr) {
      return res.status(200).send(text);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unexpected server error" });
  }
};
