"use client"

import { useState } from "react"
import Papa from "papaparse"

export default function ImportPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })

      const mapped = (parsed.data as any[]).map((row) => {
        const options = [
          row.option1, row.option2, row.option3, row.option4, row.option5,
        ].filter(Boolean)

        const correct = (row.correct_answer || "")
          .split(";")
          .map((letter: string) => "ABCDE".indexOf(letter.trim().toUpperCase()))
          .filter((i: number) => i >= 0)

        return {
          question: row.question,
          options,
          correct,
          subject: row.subject || "",
          module: row.module || "",
          year: row.year || null,
          difficulty: row.difficulty || "medium",
          explanation: row.explanation || "",
        }
      })

      setQuestions(mapped)
      setStatus(`✓ ${mapped.length} questions parsed — ready to import`)
    }
    reader.readAsText(file)
  }

  const upload = async () => {
    if (questions.length === 0) return
    setLoading(true)
    setStatus("Importing...")

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      })
      const data = await res.json()

      if (data.success) {
        setStatus(`✅ ${data.inserted} / ${data.total} questions imported successfully!`)
        if (data.errors?.length) {
          console.error("Partial errors:", data.errors)
          setStatus(prev => prev + ` (${data.errors.length} errors — check console)`)
        }
      } else {
        setStatus(`❌ Error: ${data.error}`)
      }
    } catch (err) {
      setStatus("❌ Network error")
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 600 }}>
      <h1>Import Questions CSV</h1>

      <p style={{ color: "#666", fontSize: 14 }}>
        Expected columns: <code>question, option1, option2, option3, option4, option5, correct_answer, subject, module, year, difficulty, explanation</code>
        <br />
        correct_answer format: <code>A</code> or <code>A;C</code> for multi-answer
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        style={{ marginBottom: 16 }}
      />

      {questions.length > 0 && (
        <div style={{ marginBottom: 16, padding: 12, background: "#f0fff0", borderRadius: 8, fontSize: 14 }}>
          {questions.length} questions ready — first question: <em>{questions[0]?.question?.slice(0, 60)}...</em>
        </div>
      )}

      <br />

      <button
        onClick={upload}
        disabled={loading || questions.length === 0}
        style={{ padding: "10px 24px", background: questions.length > 0 ? "#c8f04e" : "#ccc", border: "none", borderRadius: 8, fontWeight: 700, cursor: questions.length > 0 ? "pointer" : "not-allowed", fontSize: 14 }}
      >
        {loading ? "Importing..." : `Import ${questions.length} questions`}
      </button>

      {status && (
        <div style={{ marginTop: 20, padding: 14, background: "#f9f9f9", borderRadius: 8, fontSize: 14 }}>
          {status}
        </div>
      )}
    </div>
  )
}
