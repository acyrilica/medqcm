import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Use browser client directly - skip auth check for now
    const supabase = createClient()

    const { questions } = await req.json()

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Invalid questions array' }, { status: 400 })
    }

    let inserted = 0
    const errors: string[] = []

    for (const q of questions) {
      try {
        // Upsert subject
        let subjectId: number | null = null
        if (q.subject) {
          const { data: subject, error: subjectError } = await supabase
            .from('subjects')
            .upsert({ name: q.subject }, { onConflict: 'name' })
            .select('id').single()
          if (subjectError) throw new Error(`Subject error: ${subjectError.message}`)
          subjectId = subject?.id ?? null
        }
        if (q.subject) {
          const { data: subject, error: subjectError } = await supabase
            .from('subjects')
            .upsert({ name: q.subject }, { onConflict: 'name' })
            .select('id').single()
          
          console.log("SUBJECT DATA:", subject)
          console.log("SUBJECT ERROR:", JSON.stringify(subjectError))
          
          if (subjectError) throw new Error(`Subject error: ${subjectError.message}`)
          subjectId = subject?.id ?? null
        }

        // Upsert module
        let moduleId: number | null = null
        if (q.module && subjectId) {
          const { data: mod, error: modError } = await supabase
            .from('modules')
            .upsert({ name: q.module, subject_id: subjectId }, { onConflict: 'name' })
            .select('id').single()
          if (modError) throw new Error(`Module error: ${modError.message}`)
          moduleId = mod?.id ?? null
        }

        // Insert question
        const { data: question, error: qError } = await supabase
          .from('questions')
          .insert({
            question_text: q.question,
            explanation: q.explanation || null,
            subject_id: subjectId,
            module_id: moduleId,
            year: q.year ? parseInt(q.year) : null,
            difficulty: q.difficulty || 'medium',
          })
          .select('id').single()
        if (qError) throw new Error(`Question error: ${qError.message}`)

        // Insert options
        if (q.options && q.options.length > 0) {
          const { error: optError } = await supabase.from('options').insert(
            q.options.map((text: string, i: number) => ({
              question_id: question!.id,
              option_text: text,
              is_correct: Array.isArray(q.correct) ? q.correct.includes(i) : false,
              display_order: i,
            }))
          )
          if (optError) throw new Error(`Options error: ${optError.message}`)
        }

        inserted++
      } catch (err: any) {
        errors.push(`Q"${q.question?.slice(0, 30)}...": ${err.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      inserted,
      total: questions.length,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (err: any) {
    console.error('Import API error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}