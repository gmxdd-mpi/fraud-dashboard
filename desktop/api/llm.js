export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    console.log("Anthropic raw response:", text);

    let data;
    try { data = JSON.parse(text); }
    catch { return res.status(500).json({ error: "Invalid JSON from Anthropic", raw: text }); }

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.status(200).json(data);
  } catch (err) {
    console.log("Handler error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
