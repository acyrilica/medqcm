import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { questions } = await req.json()

  for (const q of questions) {
    // Upsert subject
    const { data: subject } = await supabase
      .from('subjects').upsert({ name: q.subject }, { onConflict: 'name' })
      .select().single()

    // Upsert module
    const { data: module } = await supabase
      .from('modules').upsert({ name: q.module, subject_id: subject.id }, { onConflict: 'name,subject_id' })
      .select().single()

    // Insert question
    const { data: question } = await supabase
      .from('questions')
      .insert({
        question_text: q.question,
        explanation: q.explanation,
        subject_id: subject.id,
        module_id: module.id,
        year: parseInt(q.year) || null,
        difficulty: q.difficulty || 'medium',
      })
      .select().single()

    // Insert options
    await supabase.from('options').insert(
      q.options.map((text: string, i: number) => ({
        question_id: question.id,
        option_text: text,
        is_correct: q.correct.includes(i),  // correct is array of indices
        display_order: i,
      }))
    )
  }

  return NextResponse.json({ success: true, count: questions.length })
}