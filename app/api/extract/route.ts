import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Convert Anthropic-style messages to Gemini format
    const contents = messages.map((msg: any) => {
      if (typeof msg.content === 'string') {
        return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }
      }
      // Handle content array (with images/documents/text)
      const parts = msg.content.map((c: any) => {
        if (c.type === 'text') return { text: c.text }
        if (c.type === 'image') return { inline_data: { mime_type: c.source.media_type, data: c.source.data } }
        if (c.type === 'document') return { inline_data: { mime_type: 'application/pdf', data: c.source.data } }
        return { text: '' }
      })
      return { role: 'user', parts }
    })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    )

    const data = await response.json()

    if (data.error) {
      console.error('Gemini error:', data.error)
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    // Convert Gemini response back to Anthropic-style so extract page works unchanged
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return NextResponse.json({
      content: [{ type: 'text', text }]
    })

  } catch (err: any) {
    console.error('Extract API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}