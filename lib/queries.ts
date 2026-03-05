import { createClient } from './supabase'

const supabase = createClient()

// Fetch all questions with their options
export async function getQuestions(filters?: {
  subject?: string
  module?: string
  year?: number
}) {
  let query = supabase
    .from('questions')
    .select(`
      *,
      options (*),
      subjects (name),
      modules (name)
    `)
    .order('created_at', { ascending: false })

  if (filters?.subject) {
    query = query.eq('subjects.name', filters.subject)
  }

  const { data, error } = await query
  if (error) throw error

  // Transform to match your component's format
  return data.map(q => ({
    id: q.id,
    question: q.question_text,
    options: q.options
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((o: any) => o.option_text),
    correct: q.options
      .map((o: any, i: number) => ({ i, is_correct: o.is_correct }))
      .filter((o: any) => o.is_correct)
      .map((o: any) => o.i),
    explanation: q.explanation,
    subject: q.subjects?.name,
    module: q.modules?.name,
    year: q.year,
    difficulty: q.difficulty,
  }))
}

// Save a completed attempt
export async function saveAttempt(
  userId: string,
  examId: number | null,
  mode: 'training' | 'exam',
  score: number,
  answers: Array<{
    questionId: number
    selectedOptionIds: number[]
    isCorrect: boolean
    isPartial: boolean
  }>
) {
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .insert({ user_id: userId, exam_id: examId, mode, score, finished_at: new Date().toISOString() })
    .select()
    .single()

  if (attemptError) throw attemptError

  const { error: answersError } = await supabase.from('answers').insert(
    answers.map(a => ({
      attempt_id: attempt.id,
      question_id: a.questionId,
      selected_option_ids: a.selectedOptionIds,
      is_correct: a.isCorrect,
      is_partial: a.isPartial,
    }))
  )

  if (answersError) throw answersError
  return attempt
}

// Get user stats
export async function getUserStats(userId: string) {
  const { data: attempts } = await supabase
    .from('attempts')
    .select('score, finished_at, mode')
    .eq('user_id', userId)
    .not('finished_at', 'is', null)
    .order('finished_at', { ascending: false })
    .limit(50)

  const scores = attempts?.map(a => a.score) ?? []
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  return {
    totalQuizzes: scores.length,
    avgScore,
    recentScores: scores.slice(0, 10).reverse(),
  }
}

// Toggle bookmark
export async function toggleBookmark(userId: string, questionId: number) {
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .single()

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id)
    return false
  } else {
    await supabase.from('bookmarks').insert({ user_id: userId, question_id: questionId })
    return true
  }
}
