"use client"

import { useState } from "react"
import Papa from "papaparse"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)

  const upload = async () => {
    if (!file) return

    const text = await file.text()

    const parsed = Papa.parse(text, { header: true })

    const questions = (parsed.data as any[]).map((row) => {
      const options = [
        row.option1,
        row.option2,
        row.option3,
        row.option4,
        row.option5,
      ].filter(Boolean)

      const correct = row.correct_answer
        .split("")
        .map((letter: string) => "ABCDE".indexOf(letter))

      return {
        question: row.question,
        options,
        correct,
        subject: row.subject,
        module: row.module,
        year: row.year,
        difficulty: row.difficulty || "medium",
        explanation: row.explanation,
      }
    })

    await fetch("/api/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questions }),
    })

    alert("Import finished")
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Import Questions CSV</h1>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={upload}>
        Import
      </button>
    </div>
  )
}