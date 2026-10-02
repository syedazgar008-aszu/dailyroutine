export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  const key = process.env.GEMINI_API_KEY
  if (!key) { res.status(200).json({ items: [], error: 'missing_key' }); return }
  try {
    const { image, mimeType } = req.body || {}
    if (!image) { res.status(400).json({ error: 'No image provided' }); return }
    const prompt = `You are a nutrition estimator. Look at this food photo and identify each distinct food item visible, with a reasonable estimate of the portion size. For each item, estimate calories (kcal), protein (g), carbs (g), and fat (g). Respond with ONLY a raw JSON array, no markdown, no explanation, in this exact shape: [{"name":"food name (portion)","kcal":123,"p":12,"c":20,"f":5}]. If you cannot identify any food, respond with [].`
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType || 'image/jpeg', data: image } }] }] })
    })
    const data = await r.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    const match = text.match(/\[[\s\S]*\]/)
    let items = []
    try { items = JSON.parse(match ? match[0] : text) } catch { items = [] }
    items = (Array.isArray(items) ? items : []).map(it => ({
      name: String(it.name || 'Food item').slice(0, 80),
      kcal: Math.max(0, Math.round(+it.kcal || 0)),
      p: Math.max(0, +(+it.p || 0).toFixed(1)),
      c: Math.max(0, +(+it.c || 0).toFixed(1)),
      f: Math.max(0, +(+it.f || 0).toFixed(1)),
    }))
    res.status(200).json({ items })
  } catch (e) {
    res.status(200).json({ items: [], error: 'analyze_failed' })
  }
}
