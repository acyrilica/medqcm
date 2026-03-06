"use client"

import { useState, useRef } from "react"

interface ExtractedQuestion {
  question: string
  options: string[]
  correct: number[]
  explanation: string
  subject: string
  module: string
  year: string
  difficulty: string
}

export default function ExtractPage() {
  const [file, setFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([])
  const [importing, setImporting] = useState(false)
  const [status, setStatus] = useState("")
  const [globalMeta, setGlobalMeta] = useState({ subject: "", module: "", year: "", difficulty: "medium" })
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload")
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(",")[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const extract = async () => {
    if (!file) return
    setExtracting(true)
    setStatus("Reading file...")

    try {
      const base64 = await toBase64(file)
      const isPDF = file.type === "application/pdf"
      const isImage = file.type.startsWith("image/")

      setStatus("Sending to AI for extraction...")

      const messages: any[] = []

      if (isPDF) {
        messages.push({
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: base64 }
            },
            {
              type: "text",
              text: PROMPT
            }
          ]
        })
      } else if (isImage) {
        messages.push({
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: file.type, data: base64 }
            },
            {
              type: "text",
              text: PROMPT
            }
          ]
        })
      } else {
        // Text/Word file - read as text
        const text = await file.text()
        messages.push({
          role: "user",
          content: `${PROMPT}\n\nHere is the content:\n\n${text}`
        })
      }

        const response = await fetch("/api/extract", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages }),
})

      const data = await response.json()
      const text = data.content?.map((c: any) => c.text || "").join("")

      // Parse JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error("Could not parse AI response")

      let parsed: any[] = JSON.parse(jsonMatch[0])

      // Split questions with more than 5 options
      const split: ExtractedQuestion[] = []
      for (const q of parsed) {
        if (q.options.length <= 5) {
          split.push(q)
        } else {
          // Split into chunks of 5
          const chunks = []
          for (let i = 0; i < q.options.length; i += 5) {
            chunks.push(q.options.slice(i, i + 5))
          }
          chunks.forEach((chunk, ci) => {
            // Remap correct indices for this chunk
            const offset = ci * 5
            const correct = (q.correct || [])
              .map((idx: number) => idx - offset)
              .filter((idx: number) => idx >= 0 && idx < chunk.length)
            split.push({
              ...q,
              options: chunk,
              correct,
              question: chunks.length > 1 ? `${q.question} (${ci + 1}/${chunks.length})` : q.question,
            })
          })
        }
      }

      setQuestions(split.map(q => ({
        ...q,
        subject: globalMeta.subject || q.subject || "",
        module: globalMeta.module || q.module || "",
        year: globalMeta.year || q.year || "",
        difficulty: globalMeta.difficulty || q.difficulty || "medium",
      })))
      setStep("preview")
      setStatus("")
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`)
    }
    setExtracting(false)
  }

  const applyMeta = () => {
    setQuestions(prev => prev.map(q => ({
      ...q,
      subject: globalMeta.subject || q.subject,
      module: globalMeta.module || q.module,
      year: globalMeta.year || q.year,
      difficulty: globalMeta.difficulty || q.difficulty,
    })))
  }

  const updateQuestion = (i: number, field: keyof ExtractedQuestion, value: any) => {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q))
  }

  const removeQuestion = (i: number) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== i))
  }

  const importAll = async () => {
    setImporting(true)
    setStatus("Importing to database...")
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus(`✅ ${data.inserted} / ${data.total} questions imported!`)
        setStep("done")
      } else {
        setStatus(`❌ ${data.error}`)
      }
    } catch {
      setStatus("❌ Network error")
    }
    setImporting(false)
  }

  const s = styles

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>☑</div>
        <div>
          <div style={s.title}>AI Question Extractor</div>
          <div style={s.subtitle}>Upload any exam file — AI extracts everything</div>
        </div>
      </div>

      {step === "upload" && (
        <div style={s.card}>
          {/* Global metadata */}
          <div style={s.section}>
            <div style={s.sectionTitle}>📋 Metadata (applied to all questions)</div>
            <div style={s.grid2}>
              <div>
                <label style={s.label}>Matière</label>
                <input style={s.input} placeholder="ex: Physiologie" value={globalMeta.subject} onChange={e => setGlobalMeta(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div>
                <label style={s.label}>Module</label>
                <input style={s.input} placeholder="ex: Cardiologie" value={globalMeta.module} onChange={e => setGlobalMeta(p => ({ ...p, module: e.target.value }))} />
              </div>
              <div>
                <label style={s.label}>Année</label>
                <input style={s.input} placeholder="ex: 2024" value={globalMeta.year} onChange={e => setGlobalMeta(p => ({ ...p, year: e.target.value }))} />
              </div>
              <div>
                <label style={s.label}>Difficulté</label>
                <select style={s.input} value={globalMeta.difficulty} onChange={e => setGlobalMeta(p => ({ ...p, difficulty: e.target.value }))}>
                  <option value="easy">Facile</option>
                  <option value="medium">Moyen</option>
                  <option value="hard">Difficile</option>
                </select>
              </div>
            </div>
          </div>

          {/* File upload */}
          <div style={s.section}>
            <div style={s.sectionTitle}>📁 Fichier source</div>
            <div
              style={{ ...s.dropzone, ...(file ? s.dropzoneActive : {}) }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" onChange={handleFile} style={{ display: "none" }} />
              {file ? (
                <div>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#c8f04e" }}>{file.name}</div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{(file.size / 1024).toFixed(0)} KB · Click to change</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⬆️</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#888" }}>Click to upload</div>
                  <div style={{ fontSize: 12, color: "#444", marginTop: 6 }}>PDF, Word, Image, TXT</div>
                </div>
              )}
            </div>
          </div>

          {status && <div style={s.statusBox}>{status}</div>}

          <button
            onClick={extract}
            disabled={!file || extracting}
            style={{ ...s.btn, opacity: !file || extracting ? 0.5 : 1, width: "100%" }}
          >
            {extracting ? "⏳ Extraction en cours..." : "🤖 Extraire avec l'IA"}
          </button>
        </div>
      )}

      {step === "preview" && (
        <div>
          {/* Meta bar */}
          <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#c8f04e" }}>
                ✓ {questions.length} questions extraites
                {questions.some(q => q.question.includes("(1/")) && <span style={{ color: "#f4a821", marginLeft: 8, fontSize: 12 }}>· Certaines divisées automatiquement</span>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep("upload")} style={s.btnSecondary}>← Retour</button>
                <button onClick={importAll} disabled={importing} style={{ ...s.btn, opacity: importing ? 0.5 : 1 }}>
                  {importing ? "Importing..." : `✓ Importer ${questions.length} questions`}
                </button>
              </div>
            </div>

            {/* Apply global meta */}
            <div style={{ marginTop: 16, padding: "12px 16px", background: "#0d0d0d", borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>Appliquer à toutes les questions :</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input style={{ ...s.inputSm, flex: 1 }} placeholder="Matière" value={globalMeta.subject} onChange={e => setGlobalMeta(p => ({ ...p, subject: e.target.value }))} />
                <input style={{ ...s.inputSm, flex: 1 }} placeholder="Module" value={globalMeta.module} onChange={e => setGlobalMeta(p => ({ ...p, module: e.target.value }))} />
                <input style={{ ...s.inputSm, width: 80 }} placeholder="Année" value={globalMeta.year} onChange={e => setGlobalMeta(p => ({ ...p, year: e.target.value }))} />
                <button onClick={applyMeta} style={s.btnSm}>Appliquer</button>
              </div>
            </div>
          </div>

          {status && <div style={{ ...s.statusBox, margin: "12px 0" }}>{status}</div>}

          {/* Questions */}
          {questions.map((q, i) => (
            <div key={i} style={s.qCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#c8f04e", fontWeight: 700 }}>Q{i + 1}</div>
                <button onClick={() => removeQuestion(i)} style={s.removeBtn}>✕</button>
              </div>

              {/* Question text */}
              <textarea
                value={q.question}
                onChange={e => updateQuestion(i, "question", e.target.value)}
                style={s.textarea}
                rows={2}
              />

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "10px 0" }}>
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => {
                        const correct = q.correct.includes(oi)
                          ? q.correct.filter(c => c !== oi)
                          : [...q.correct, oi]
                        updateQuestion(i, "correct", correct)
                      }}
                      style={{
                        width: 22, height: 22, borderRadius: 5, border: `1.5px solid ${q.correct.includes(oi) ? "#c8f04e" : "#333"}`,
                        background: q.correct.includes(oi) ? "#c8f04e" : "transparent",
                        cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {q.correct.includes(oi) && <span style={{ fontSize: 11, color: "#0a0a0a", fontWeight: 800 }}>✓</span>}
                    </button>
                    <span style={{ fontSize: 11, color: "#555", flexShrink: 0, fontWeight: 700 }}>{String.fromCharCode(65 + oi)}.</span>
                    <input
                      value={opt}
                      onChange={e => {
                        const newOpts = [...q.options]
                        newOpts[oi] = e.target.value
                        updateQuestion(i, "options", newOpts)
                      }}
                      style={s.inputSm}
                    />
                  </div>
                ))}
              </div>

              {/* Meta */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                <input style={{ ...s.inputSm, flex: 1 }} placeholder="Matière" value={q.subject} onChange={e => updateQuestion(i, "subject", e.target.value)} />
                <input style={{ ...s.inputSm, flex: 1 }} placeholder="Module" value={q.module} onChange={e => updateQuestion(i, "module", e.target.value)} />
                <input style={{ ...s.inputSm, width: 70 }} placeholder="Année" value={q.year} onChange={e => updateQuestion(i, "year", e.target.value)} />
                <select style={{ ...s.inputSm, width: 100 }} value={q.difficulty} onChange={e => updateQuestion(i, "difficulty", e.target.value)}>
                  <option value="easy">Facile</option>
                  <option value="medium">Moyen</option>
                  <option value="hard">Difficile</option>
                </select>
              </div>

              {/* Explanation */}
              <input style={{ ...s.inputSm, width: "100%", marginTop: 8 }} placeholder="Explication (optionnel)" value={q.explanation} onChange={e => updateQuestion(i, "explanation", e.target.value)} />
            </div>
          ))}

          <button onClick={importAll} disabled={importing} style={{ ...s.btn, width: "100%", marginTop: 16 }}>
            {importing ? "Importing..." : `✓ Importer ${questions.length} questions`}
          </button>
        </div>
      )}

      {step === "done" && (
        <div style={{ ...s.card, textAlign: "center", padding: "60px 40px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#c8f04e", marginBottom: 8 }}>Import réussi !</div>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 28 }}>{status}</div>
          <button onClick={() => { setStep("upload"); setQuestions([]); setFile(null); setStatus("") }} style={s.btn}>
            ← Importer un autre fichier
          </button>
        </div>
      )}
    </div>
  )
}

const PROMPT = `You are a medical exam question extractor. Extract ALL questions from this document.

Return ONLY a valid JSON array, no other text. Format:
[
  {
    "question": "Full question text",
    "options": ["option A text", "option B text", "option C text", "option D text", "option E text"],
    "correct": [1],
    "explanation": "explanation if present, empty string if not",
    "subject": "subject if detectable, empty string if not",
    "module": "module if detectable, empty string if not",
    "year": "year if detectable, empty string if not",
    "difficulty": "medium"
  }
]

Rules:
- "correct" is an array of 0-based indices (0=A, 1=B, 2=C, etc.)
- If correct answer is not marked, use empty array []
- Include ALL options even if more than 5
- Preserve the exact text of questions and options
- Handle French, Arabic, and English text
- Return ONLY the JSON array, nothing else`

const styles: Record<string, React.CSSProperties> = {
  page: { background: "#0a0a0a", minHeight: "100vh", padding: "32px 20px 80px", fontFamily: "'DM Sans', sans-serif", color: "#e0e0e0", maxWidth: 800, margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 28 },
  logo: { width: 44, height: 44, background: "#c8f04e", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  title: { fontSize: 22, fontWeight: 800, color: "#f0f0f0" },
  subtitle: { fontSize: 13, color: "#555", marginTop: 2 },
  card: { background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "24px", marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 12 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { fontSize: 11, color: "#555", fontWeight: 600, display: "block", marginBottom: 6 },
  input: { width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", color: "#e0e0e0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  inputSm: { background: "#0d0d0d", border: "1px solid #222", borderRadius: 6, padding: "7px 10px", color: "#ccc", fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  textarea: { width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", color: "#e0e0e0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" },
  dropzone: { border: "2px dashed #222", borderRadius: 12, padding: "40px 20px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" },
  dropzoneActive: { border: "2px dashed #c8f04e", background: "#c8f04e08" },
  btn: { background: "#c8f04e", color: "#0a0a0a", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  btnSecondary: { background: "#1a1a1a", color: "#c8f04e", border: "1px solid #2a2a2a", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnSm: { background: "#c8f04e", color: "#0a0a0a", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  removeBtn: { background: "#f04e4e22", color: "#f04e4e", border: "1px solid #f04e4e44", borderRadius: 6, padding: "2px 8px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" },
  statusBox: { background: "#c8f04e11", border: "1px solid #c8f04e33", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#c8f04e" },
  qCard: { background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, padding: "16px", marginBottom: 12 },
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; }
  button, input, textarea, select { font-family: inherit; }
  select option { background: #1a1a1a; }
`
