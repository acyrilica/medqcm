'use client'
import { useState, useEffect, useRef } from "react";
import { createClient } from '@/lib/supabase';

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number[];
  explanation: string;
  subject: string;
  module: string;
  year: number;
  difficulty: string;
}

interface QuizConfig {
  questions: Question[];
  mode: 'training' | 'exam';
}

interface ScoreResult {
  status: 'correct' | 'partial' | 'wrong';
  partialPct: number;
}

// ── SCORING ───────────────────────────────────────────────────────────────────
function scoreAnswer(correctArr: number[], selectedSet: Set<number>): ScoreResult {
  if (selectedSet.size === 0) return { status: "wrong", partialPct: 0 };
  const hits = [...selectedSet].filter(i => correctArr.includes(i)).length;
  const wrongs = [...selectedSet].filter(i => !correctArr.includes(i)).length;
  if (hits === correctArr.length && wrongs === 0) return { status: "correct", partialPct: 100 };
  if (wrongs > 0 || hits === 0) return { status: "wrong", partialPct: 0 };
  return { status: "partial", partialPct: Math.round((hits / correctArr.length) * 100) };
}

// ── ICONS ─────────────────────────────────────────────────────────────────────
function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const icons = {
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  quiz: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2 M9 12l2 2 4-4",
  bookmark: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z",
  admin: "M12 2L2 7l10 5 10-5-10-5 M2 17l10 5 10-5 M2 12l10 5 10-5",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7",
  clock: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  arrow_left: "M19 12H5 M12 19l-7-7 7-7",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  plus: "M12 5v14 M5 12h14",
  trash: "M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
};

// ── SHARED STYLES ─────────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = { background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, padding: "14px 16px" };
const navBtnStyle: React.CSSProperties = { background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#ccc", borderRadius: 10, padding: "10px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600 };

function btnStyle(bg: string, color: string, borderColor?: string, small?: boolean): React.CSSProperties {
  return { background: bg, color, border: borderColor ? `1.5px solid ${borderColor}` : "none", borderRadius: 10, padding: small ? "9px 18px" : "11px 20px", fontSize: small ? 12 : 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
}

function tagStyle(color: string): React.CSSProperties {
  return { fontSize: 10, background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 8px", fontWeight: 600 };
}

// ── OPTION BUTTON ─────────────────────────────────────────────────────────────
interface OptionBtnProps {
  label: string;
  text: string;
  selected: boolean;
  feedback: boolean;
  isCorrectOpt: boolean;
  isMulti: boolean;
  disabled: boolean;
  onToggle: () => void;
}

function OptionBtn({ label, text, selected, feedback, isCorrectOpt, isMulti, disabled, onToggle }: OptionBtnProps) {
  let bg = "#111", border = "#252525", color = "#ccc", boxBg = "#1a1a1a", boxColor = "#555";
  if (feedback) {
    if (isCorrectOpt) { bg = "#c8f04e0e"; border = "#c8f04e"; color = "#d4f570"; boxBg = "#c8f04e"; boxColor = "#0a0a0a"; }
    else if (selected) { bg = "#f04e4e0e"; border = "#f04e4e"; color = "#f07070"; boxBg = "#f04e4e"; boxColor = "#fff"; }
  } else if (selected) {
    bg = "#c8f04e0e"; border = "#c8f04e88"; color = "#d4f570"; boxBg = "#c8f04e"; boxColor = "#0a0a0a";
  }
  return (
    <button onClick={onToggle} disabled={disabled}
      style={{ display: "flex", alignItems: "flex-start", gap: 12, background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "13px 14px", cursor: disabled ? "default" : "pointer", textAlign: "left", width: "100%", fontFamily: "inherit" }}>
      <div style={{ width: 22, height: 22, borderRadius: isMulti ? 5 : "50%", background: selected || (feedback && isCorrectOpt) ? boxBg : "#141414", border: `1.5px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        {selected || (feedback && isCorrectOpt)
          ? <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={boxColor} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          : <span style={{ color: "#3a3a3a", fontSize: 10, fontWeight: 700 }}>{label}</span>}
      </div>
      <div style={{ fontSize: 13, color, lineHeight: 1.55, paddingTop: 2, flex: 1 }}>{text}</div>
      {feedback && isCorrectOpt && <div style={{ flexShrink: 0, fontSize: 9, background: "#c8f04e", color: "#0a0a0a", borderRadius: 4, padding: "2px 6px", fontWeight: 800, alignSelf: "center" }}>✓</div>}
      {feedback && selected && !isCorrectOpt && <div style={{ flexShrink: 0, fontSize: 9, background: "#f04e4e", color: "#fff", borderRadius: 4, padding: "2px 6px", fontWeight: 800, alignSelf: "center" }}>✗</div>}
    </button>
  );
}

// ── QUIZ ──────────────────────────────────────────────────────────────────────
function Quiz({ config, setPage }: { config: QuizConfig; setPage: (p: string) => void }) {
  const { questions, mode } = config;
  const [selections, setSelections] = useState<Record<number, Set<number>>>({});
  const [confirmed, setConfirmed] = useState<Set<number>>(new Set());
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'question' | 'results'>('question');
  const [timeLeft, setTimeLeft] = useState<number | null>(mode === "exam" ? questions.length * 90 : null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (mode === "exam" && phase === "question") {
      timerRef.current = setInterval(() => setTimeLeft((t: number | null) => {
        if (t === null || t <= 1) { clearInterval(timerRef.current!); setPhase("results"); return 0; }
        return t - 1;
      }), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode, phase]);

  const q = questions[idx];
  const isMulti = q.correct.length > 1;
  const curSel: Set<number> = selections[idx] || new Set();
  const isConfirmed = confirmed.has(idx);
  const showFeedback = mode === "training" && isConfirmed;

  const toggle = (oi: number) => {
    if (isConfirmed) return;
    setSelections((prev: Record<number, Set<number>>) => {
      const next = new Set(prev[idx] || []);
      if (isMulti) { next.has(oi) ? next.delete(oi) : next.add(oi); }
      else { next.clear(); next.add(oi); }
      return { ...prev, [idx]: next };
    });
  };

  const confirm = () => { if (curSel.size === 0) return; setConfirmed((prev: Set<number>) => new Set([...prev, idx])); };
  const goSubmit = () => { if (timerRef.current) clearInterval(timerRef.current); setPhase("results"); };

  if (phase === "results") {
    let totalScore = 0;
    const breakdown = questions.map((q2: Question, i: number) => {
      const sel: Set<number> = selections[i] || new Set();
      const res = scoreAnswer(q2.correct, sel);
      if (res.status === "correct") totalScore += 1;
      else if (res.status === "partial") totalScore += res.partialPct / 100;
      return { q: q2, sel, res };
    });
    const pct = Math.round((totalScore / questions.length) * 100);
    const scoreColor = pct >= 75 ? "#c8f04e" : pct >= 50 ? "#f4a821" : "#f04e4e";

    return (
      <div style={{ padding: "24px 20px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 60, fontWeight: 900, color: scoreColor, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>{totalScore.toFixed(1)} / {questions.length} points</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14 }}>
            {([
              { label: "Correctes", count: breakdown.filter((b: {res: ScoreResult}) => b.res.status === "correct").length, color: "#c8f04e" },
              { label: "Partielles", count: breakdown.filter((b: {res: ScoreResult}) => b.res.status === "partial").length, color: "#f4a821" },
              { label: "Fausses", count: breakdown.filter((b: {res: ScoreResult}) => b.res.status === "wrong").length, color: "#f04e4e" },
            ] as { label: string; count: number; color: string }[]).map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "8px 16px", background: `${s.color}11`, border: `1px solid ${s.color}33`, borderRadius: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 10, color: "#666" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28 }}>
          <button onClick={() => setPage("home")} style={btnStyle("#1a1a1a", "#c8f04e", "#2a2a2a")}>← Accueil</button>
          <button onClick={() => { setSelections({}); setConfirmed(new Set()); setIdx(0); setPhase("question"); setTimeLeft(mode === "exam" ? questions.length * 90 : null); }} style={btnStyle("#c8f04e", "#0a0a0a")}>Recommencer</button>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", marginBottom: 14 }}>Révision détaillée</div>
        {breakdown.map(({ q: q2, sel, res }: { q: Question; sel: Set<number>; res: ScoreResult }, i: number) => (
          <div key={i} style={{ ...cardStyle, marginBottom: 10, borderColor: res.status === "correct" ? "#c8f04e44" : res.status === "partial" ? "#f4a82144" : "#f04e4e44" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: res.status === "correct" ? "#c8f04e" : res.status === "partial" ? "#f4a821" : "#f04e4e" }}>
                {res.status === "correct" ? "✓ Correcte" : res.status === "partial" ? `~ Partielle (${res.partialPct}%)` : "✗ Incorrecte"}
              </span>
              {q2.correct.length > 1 && <span style={tagStyle("#888")}>{q2.correct.length} réponses attendues</span>}
            </div>
            <div style={{ fontSize: 12, color: "#ccc", marginBottom: 10, lineHeight: 1.55 }}>{q2.question}</div>
            {q2.options.map((o: string, oi: number) => {
              const isC = q2.correct.includes(oi), isSel = sel.has(oi);
              return (
                <div key={oi} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, marginBottom: 3, background: isC ? "#c8f04e1a" : isSel ? "#f04e4e1a" : "transparent", color: isC ? "#c8f04e" : isSel ? "#f04e4e" : "#444", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 700, flexShrink: 0 }}>{String.fromCharCode(65 + oi)}.</span>
                  <span style={{ flex: 1 }}>{o}</span>
                  {isC && <span style={{ fontSize: 9, background: "#c8f04e", color: "#0a0a0a", borderRadius: 3, padding: "1px 5px", fontWeight: 800 }}>✓</span>}
                  {isSel && !isC && <span style={{ fontSize: 9, background: "#f04e4e", color: "#fff", borderRadius: 3, padding: "1px 5px", fontWeight: 800 }}>✗</span>}
                </div>
              );
            })}
            {q2.explanation && <div style={{ fontSize: 11, color: "#888", marginTop: 10, padding: "10px 12px", background: "#0d0d0d", borderRadius: 8, lineHeight: 1.65 }}>💡 {q2.explanation}</div>}
          </div>
        ))}
      </div>
    );
  }

  const { status: feedStatus, partialPct } = showFeedback ? scoreAnswer(q.correct, curSel) : { status: null as null, partialPct: 0 };
  const feedbackColor = feedStatus === "correct" ? "#c8f04e" : feedStatus === "partial" ? "#f4a821" : "#f04e4e";
  const feedbackLabel = feedStatus === "correct" ? "✓ Parfait !" : feedStatus === "partial" ? `~ Partielle — ${partialPct}% des bonnes réponses` : "✗ Incorrecte";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ padding: "12px 16px", background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", padding: 0 }}><Icon d={icons.arrow_left} size={18} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ height: 4, background: "#1a1a1a", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${((idx + 1) / questions.length) * 100}%`, height: "100%", background: "#c8f04e", borderRadius: 4, transition: "width 0.3s" }} />
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#666", flexShrink: 0 }}>{idx + 1} / {questions.length}</div>
        {mode === "exam" && timeLeft !== null && (
          <div style={{ fontSize: 11, color: timeLeft < 60 ? "#f04e4e" : "#888", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <Icon d={icons.clock} size={13} /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "18px 16px 110px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          {q.subject && <span style={tagStyle("#c8f04e")}>{q.subject}</span>}
          {q.module && <span style={tagStyle("#4e80f0")}>{q.module}</span>}
          {isMulti
            ? <span style={{ ...tagStyle("#f4a821"), fontWeight: 700 }}>☑ {q.correct.length} réponses correctes</span>
            : <span style={tagStyle("#555")}>◉ 1 réponse correcte</span>}
          {q.year > 0 && <span style={{ ...tagStyle("#333"), marginLeft: "auto" }}>{q.year}</span>}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f0", lineHeight: 1.65, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>{q.question}</div>
        <div style={{ fontSize: 11, color: "#3a3a3a", marginBottom: 16 }}>{isMulti ? "Cochez toutes les réponses correctes" : "Sélectionnez une seule réponse"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {q.options.map((o: string, oi: number) => (
            <OptionBtn key={oi} label={String.fromCharCode(65 + oi)} text={o} selected={curSel.has(oi)} feedback={showFeedback} isCorrectOpt={q.correct.includes(oi)} isMulti={isMulti} disabled={showFeedback} onToggle={() => toggle(oi)} />
          ))}
        </div>
        {isMulti && !isConfirmed && curSel.size > 0 && (
          <div style={{ fontSize: 11, color: "#555", textAlign: "center", marginBottom: 10 }}>
            {curSel.size} sélectionnée{curSel.size > 1 ? "s" : ""} · {q.correct.length} attendue{q.correct.length > 1 ? "s" : ""}
          </div>
        )}
        {mode === "training" && !isConfirmed && (
          <button onClick={confirm} disabled={curSel.size === 0}
            style={{ ...btnStyle(curSel.size === 0 ? "#141414" : "#c8f04e", curSel.size === 0 ? "#333" : "#0a0a0a"), width: "100%", marginBottom: 12, opacity: curSel.size === 0 ? 0.5 : 1 }}>
            Valider ma réponse
          </button>
        )}
        {showFeedback && feedStatus && (
          <div style={{ background: `${feedbackColor}0d`, border: `1px solid ${feedbackColor}44`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: feedbackColor, marginBottom: 6 }}>{feedbackLabel}</div>
            {isMulti && <div style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>Bonnes réponses : {q.correct.map((i: number) => String.fromCharCode(65 + i)).join(", ")}</div>}
            {q.explanation && <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.65 }}>💡 {q.explanation}</div>}
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 900, background: "#0d0d0d", borderTop: "1px solid #1a1a1a", padding: "10px 16px", display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setFlagged((prev: Set<number>) => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; })} style={{ background: flagged.has(idx) ? "#f4a82122" : "#111", border: `1px solid ${flagged.has(idx) ? "#f4a821" : "#2a2a2a"}`, borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: flagged.has(idx) ? "#f4a821" : "#555" }}><Icon d={icons.flag} size={15} /></button>
          <button onClick={() => setBookmarked((prev: Set<number>) => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; })} style={{ background: bookmarked.has(idx) ? "#4e80f022" : "#111", border: `1px solid ${bookmarked.has(idx) ? "#4e80f0" : "#2a2a2a"}`, borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: bookmarked.has(idx) ? "#4e80f0" : "#555" }}><Icon d={icons.bookmark} size={15} /></button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {idx > 0 && <button onClick={() => setIdx((i: number) => i - 1)} style={navBtnStyle}>← Préc.</button>}
          {idx < questions.length - 1
            ? <button onClick={() => setIdx((i: number) => i + 1)} style={{ ...navBtnStyle, background: "#c8f04e", color: "#0a0a0a", border: "none", fontWeight: 700 }}>Suiv. →</button>
            : <button onClick={goSubmit} style={{ ...navBtnStyle, background: "#c8f04e", color: "#0a0a0a", border: "none", fontWeight: 700 }}>Terminer ✓</button>}
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ questions, setPage, setQuizConfig }: { questions: Question[]; setPage: (p: string) => void; setQuizConfig: (c: QuizConfig) => void }) {
  const subjects = [...new Set(questions.map((q: Question) => q.subject).filter(Boolean))];
  const start = (mode: 'training' | 'exam', qs: Question[] = questions) => { setQuizConfig({ questions: qs, mode }); setPage("quiz"); };

  return (
    <div style={{ padding: "0 0 40px" }}>
      <div style={{ background: "linear-gradient(135deg, #c8f04e11 0%, #0a0a0a 60%)", borderBottom: "1px solid #1e1e1e", padding: "32px 28px 28px" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#c8f04e", textTransform: "uppercase", marginBottom: 8 }}>Bon retour 👋</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#f0f0f0", fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>Tableau de bord</div>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>Médecine · Faculté de Médecine d&apos;Oujda</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => start("training")} style={btnStyle("#c8f04e", "#0a0a0a")}>⚡ Entraînement</button>
          <button onClick={() => start("exam")} style={btnStyle("transparent", "#c8f04e", "#c8f04e")}>🎯 Mode Examen</button>
        </div>
      </div>
      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {([
            { label: "Questions", value: questions.length, icon: "📋", color: "#c8f04e" },
            { label: "Matières", value: subjects.length, icon: "📚", color: "#4ecbf0" },
            { label: "Multi-réponses", value: questions.filter((q: Question) => q.correct.length > 1).length, icon: "☑", color: "#f04e4e" },
            { label: "Année récente", value: Math.max(0, ...questions.map((q: Question) => q.year || 0)) || "—", icon: "📅", color: "#b44ef0" },
          ] as { label: string; value: string | number; icon: string; color: string }[]).map((s, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {subjects.length > 0 && (
          <div style={cardStyle}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", marginBottom: 14 }}>Réviser par matière</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {subjects.map((s: string, i: number) => {
                const count = questions.filter((q: Question) => q.subject === s).length;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < subjects.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#ccc", fontWeight: 600 }}>{s}</div>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{count} question{count > 1 ? "s" : ""}</div>
                    </div>
                    <button onClick={() => start("training", questions.filter((q: Question) => q.subject === s))}
                      style={{ fontSize: 11, background: "#c8f04e22", color: "#c8f04e", border: "1px solid #c8f04e44", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                      Pratiquer
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── QUIZ LIST ─────────────────────────────────────────────────────────────────
function QuizList({ questions, setPage, setQuizConfig }: { questions: Question[]; setPage: (p: string) => void; setQuizConfig: (c: QuizConfig) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const subjects = [...new Set(questions.map((q: Question) => q.subject).filter(Boolean))];
  const filtered = questions.filter((q: Question) =>
    (filter === "all" || q.subject === filter) &&
    q.question.toLowerCase().includes(search.toLowerCase())
  );
  const startQuiz = (mode: 'training' | 'exam') => { if (filtered.length === 0) return; setQuizConfig({ questions: filtered, mode }); setPage("quiz"); };

  return (
    <div style={{ padding: "20px 20px 40px" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#f0f0f0", fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>Bibliothèque QCM</div>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#555" }}><Icon d={icons.search} size={15} /></div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une question..." style={{ width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 10, padding: "10px 12px 10px 36px", color: "#e0e0e0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {["all", ...subjects].map((s: string) => (
          <button key={s} onClick={() => setFilter(s)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", background: filter === s ? "#c8f04e" : "#1a1a1a", color: filter === s ? "#0a0a0a" : "#888", border: "none", fontFamily: "inherit" }}>
            {s === "all" ? `Tout (${questions.length})` : s}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={() => startQuiz("training")} style={btnStyle("#c8f04e", "#0a0a0a", undefined, true)}>⚡ Entraînement ({filtered.length})</button>
        <button onClick={() => startQuiz("exam")} style={btnStyle("#1a1a1a", "#c8f04e", "#c8f04e", true)}>🎯 Examen</button>
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#333" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 13 }}>Aucune question trouvée</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((q: Question) => (
            <div key={q.id} style={{ ...cardStyle, cursor: "pointer" }} onClick={() => { setQuizConfig({ questions: [q], mode: "training" }); setPage("quiz"); }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                {q.subject && <span style={tagStyle("#c8f04e")}>{q.subject}</span>}
                <span style={tagStyle(q.difficulty === "easy" ? "#4ef0a0" : q.difficulty === "medium" ? "#f4a821" : "#f04e4e")}>{q.difficulty}</span>
                {q.correct.length > 1 && <span style={tagStyle("#f4a821")}>☑ {q.correct.length} rép.</span>}
                {q.year > 0 && <span style={{ marginLeft: "auto", fontSize: 10, color: "#444" }}>{q.year}</span>}
              </div>
              <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.5 }}>{q.question}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── BOOKMARKS ─────────────────────────────────────────────────────────────────
function Bookmarks({ questions, setPage, setQuizConfig }: { questions: Question[]; setPage: (p: string) => void; setQuizConfig: (c: QuizConfig) => void }) {
  const [tab, setTab] = useState<'bookmarks' | 'mistakes'>('bookmarks');
  const bookmarked = questions.slice(0, Math.min(3, questions.length));
  const mistakes = questions.slice(Math.max(0, questions.length - 3));
  const current = tab === 'bookmarks' ? bookmarked : mistakes;

  return (
    <div style={{ padding: "20px 20px 40px" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#f0f0f0", fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>Cahier de révision</div>
      <div style={{ display: "flex", background: "#111", borderRadius: 10, padding: 4, marginBottom: 20, gap: 4 }}>
        {([['bookmarks', '📌 Favoris'], ['mistakes', '❌ Erreurs']] as [string, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as 'bookmarks' | 'mistakes')}
            style={{ flex: 1, padding: "9px 4px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: tab === id ? "#c8f04e" : "transparent", color: tab === id ? "#0a0a0a" : "#666", fontFamily: "inherit" }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>{current.length} question{current.length > 1 ? "s" : ""}</div>
      {current.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{tab === 'bookmarks' ? '📌' : '❌'}</div>
          <div style={{ fontSize: 13, color: "#555" }}>{tab === 'bookmarks' ? "Aucun favori pour l'instant" : "Aucune erreur enregistrée"}</div>
          <div style={{ fontSize: 11, color: "#2a2a2a", marginTop: 6 }}>Faites un quiz pour commencer</div>
        </div>
      ) : (
        <>
          {current.map((q: Question) => (
            <div key={q.id} style={{ ...cardStyle, marginBottom: 8, cursor: "pointer", borderColor: tab === 'mistakes' ? "#f04e4e22" : "#1e1e1e" }}
              onClick={() => { setQuizConfig({ questions: [q], mode: "training" }); setPage("quiz"); }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                {q.subject && <span style={tagStyle(tab === 'mistakes' ? "#f04e4e" : "#4e80f0")}>{q.subject}</span>}
                {q.module && <span style={tagStyle("#555")}>{q.module}</span>}
                {q.correct.length > 1 && <span style={tagStyle("#f4a821")}>☑ {q.correct.length} rép.</span>}
              </div>
              <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.5, marginBottom: 8 }}>{q.question}</div>
              <div style={{ fontSize: 11, color: tab === 'mistakes' ? "#f04e4e" : "#4e80f0" }}>→ Pratiquer cette question</div>
            </div>
          ))}
          <button onClick={() => { setQuizConfig({ questions: current, mode: "training" }); setPage("quiz"); }}
            style={{ ...btnStyle(tab === 'mistakes' ? "#f04e4e22" : "#4e80f022", tab === 'mistakes' ? "#f04e4e" : "#4e80f0", tab === 'mistakes' ? "#f04e4e" : "#4e80f0"), width: "100%", marginTop: 8 }}>
            🔁 Réviser {tab === 'bookmarks' ? 'mes favoris' : 'mes erreurs'} ({current.length})
          </button>
        </>
      )}
    </div>
  );
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────
function Admin({ questions }: { questions: Question[] }) {
  const [tab, setTab] = useState("questions");
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState<Question[]>([]);
  const [imported, setImported] = useState(false);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = questions.filter((q: Question) => q.question.toLowerCase().includes(search.toLowerCase()));

  const parseCSV = () => {
    const lines = csvText.trim().split("\n").filter(Boolean);
    const result: Question[] = lines.map((line: string, idx: number) => {
      const parts = line.split(",");
      const rawCorrect = parts[6] || "1";
      const correctArr = rawCorrect.split(";").map((n: string) => parseInt(n.trim()) - 1).filter((n: number) => !isNaN(n));
      return { id: idx, question: parts[0], options: parts.slice(1, 6).filter(Boolean), correct: correctArr, explanation: parts[7] || "", subject: parts[8] || "", module: parts[9] || "", year: parseInt(parts[10]) || 2024, difficulty: "medium" };
    });
    setParsed(result);
  };

  const importQuestions = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/import-csv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questions: parsed }) });
      if (res.ok) setImported(true);
    } catch (e) { console.error(e); }
    setImporting(false);
  };

  return (
    <div style={{ padding: "20px 20px 40px" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#f0f0f0", fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>Panneau Admin</div>
      <div style={{ fontSize: 12, color: "#555", marginBottom: 20 }}>Gestion des questions · {questions.length} au total</div>
      <div style={{ display: "flex", background: "#111", borderRadius: 10, padding: 4, marginBottom: 20, gap: 4 }}>
        {([["questions", "📋 Questions"], ["upload", "⬆ Import CSV"], ["stats", "📊 Stats"]] as [string, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", background: tab === id ? "#c8f04e" : "transparent", color: tab === id ? "#0a0a0a" : "#666", fontFamily: "inherit" }}>{label}</button>
        ))}
      </div>
      {tab === "questions" && (
        <div>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#555" }}><Icon d={icons.search} size={14} /></div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." style={{ width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, padding: "9px 10px 9px 32px", color: "#ccc", fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
          {filtered.slice(0, 20).map((q: Question, i: number) => (
            <div key={i} style={{ ...cardStyle, marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                {q.subject && <span style={tagStyle("#c8f04e")}>{q.subject}</span>}
                {q.year > 0 && <span style={tagStyle("#4e80f0")}>{q.year}</span>}
                {q.correct.length > 1 && <span style={tagStyle("#f4a821")}>☑ {q.correct.length} rép.</span>}
              </div>
              <div style={{ fontSize: 12, color: "#ccc" }}>{q.question}</div>
            </div>
          ))}
          {filtered.length > 20 && <div style={{ textAlign: "center", fontSize: 11, color: "#555", marginTop: 8 }}>+{filtered.length - 20} autres</div>}
        </div>
      )}
      {tab === "upload" && (
        <div>
          <div style={{ ...cardStyle, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#c8f04e", marginBottom: 8 }}>Format CSV</div>
            <div style={{ fontSize: 10, color: "#666", fontFamily: "monospace", background: "#0d0d0d", padding: 10, borderRadius: 6, lineHeight: 2 }}>
              question,opt1,opt2,opt3,opt4,opt5,<span style={{ color: "#f4a821" }}>correct</span>,explication,matière,module,année<br />
              1 réponse: <span style={{ color: "#c8f04e" }}>3</span> · Multi: <span style={{ color: "#f4a821" }}>1;3;4</span>
            </div>
          </div>
          <textarea value={csvText} onChange={(e) => { setCsvText(e.target.value); setImported(false); setParsed([]); }}
            placeholder="Question,OptionA,OptionB,OptionC,OptionD,OptionE,1;3,Explication,Matière,Module,2023"
            style={{ width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 10, padding: 12, color: "#ccc", fontSize: 11, fontFamily: "monospace", minHeight: 100, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />
          <button onClick={parseCSV} style={{ ...btnStyle("#c8f04e", "#0a0a0a"), width: "100%", marginBottom: 10 }}>Analyser le CSV</button>
          {parsed.length > 0 && !imported && (
            <div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>{parsed.length} question(s) détectée(s)</div>
              {parsed.map((p: Question, i: number) => (
                <div key={i} style={{ ...cardStyle, marginBottom: 6, borderColor: "#c8f04e33" }}>
                  <div style={{ fontSize: 11, color: "#c8f04e", fontWeight: 700, marginBottom: 4 }}>Q{i + 1} · {p.subject || "N/A"}</div>
                  <div style={{ fontSize: 12, color: "#ccc", marginBottom: 4 }}>{p.question}</div>
                  <div style={{ fontSize: 10, color: "#555" }}>Réponses : {p.correct.map((c: number) => String.fromCharCode(65 + c)).join(", ")}</div>
                </div>
              ))}
              <button onClick={importQuestions} disabled={importing} style={{ ...btnStyle("#c8f04e", "#0a0a0a"), width: "100%", marginTop: 8 }}>
                {importing ? 'Import en cours...' : `✓ Importer ${parsed.length} question${parsed.length > 1 ? "s" : ""}`}
              </button>
            </div>
          )}
          {imported && <div style={{ background: "#c8f04e22", border: "1px solid #c8f04e55", borderRadius: 10, padding: 14, textAlign: "center", color: "#c8f04e", fontSize: 13, fontWeight: 700 }}>✓ Import réussi !</div>}
        </div>
      )}
      {tab === "stats" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {([
              { label: "Total questions", value: questions.length.toString(), icon: "📋" },
              { label: "Matières", value: [...new Set(questions.map((q: Question) => q.subject))].length.toString(), icon: "📚" },
              { label: "Multi-réponses", value: questions.filter((q: Question) => q.correct.length > 1).length.toString(), icon: "☑" },
              { label: "Année récente", value: (Math.max(0, ...questions.map((q: Question) => q.year || 0)) || "—").toString(), icon: "📅" },
            ] as { label: string; value: string; icon: string }[]).map((s, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#c8f04e" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch questions
        const { data, error } = await supabase
          .from('questions')
          .select(`*, options (*), subjects (name), modules (name)`)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: Question[] = data.map((q: any) => ({
            id: q.id,
            question: q.question_text,
            options: (q.options || [])
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((o: any) => o.option_text),
            correct: (q.options || [])
              .map((o: any, i: number) => ({ i, is_correct: o.is_correct }))
              .filter((o: any) => o.is_correct)
              .map((o: any) => o.i),
            explanation: q.explanation || '',
            subject: q.subjects?.name || '',
            module: q.modules?.name || '',
            year: q.year || 0,
            difficulty: q.difficulty || 'medium',
          }));
          setQuestions(mapped);
        }

        // Check admin role
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userData.user.id)
            .single();
          setIsAdmin(profile?.role === 'admin');
        }
      } catch (e) {
        console.error('Load error:', e);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const NAV = [
    { id: "home", icon: icons.home, label: "Accueil" },
    { id: "quizlist", icon: icons.quiz, label: "QCMs" },
    { id: "bookmarks", icon: icons.bookmark, label: "Révision" },
    ...(isAdmin ? [{ id: "admin", icon: icons.admin, label: "Admin" }] : []),
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ width: 32, height: 32, background: "#c8f04e", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>☑</div>
      <div style={{ color: "#c8f04e", fontSize: 13, fontWeight: 600 }}>Chargement...</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#0a0a0a", color: "#e0e0e0", minHeight: "100vh", maxWidth: 900, margin: "0 auto", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a0a; } ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        button { font-family: inherit; } input, textarea { font-family: inherit; }
      `}</style>

      {page !== "quiz" && (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px", borderBottom: "1px solid #111" }}>
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <Icon d={icons.logout} size={14} /> Déconnexion
          </button>
        </div>
      )}

      <div style={{ paddingBottom: page === "quiz" ? 0 : 64, minHeight: "100vh" }}>
        {page === "home" && <Dashboard questions={questions} setPage={setPage} setQuizConfig={setQuizConfig} />}
        {page === "quizlist" && <QuizList questions={questions} setPage={setPage} setQuizConfig={setQuizConfig} />}
        {page === "quiz" && quizConfig && <Quiz config={quizConfig} setPage={setPage} />}
        {page === "bookmarks" && <Bookmarks questions={questions} setPage={setPage} setQuizConfig={setQuizConfig} />}
        {page === "admin" && <Admin questions={questions} />}
      </div>

      {page !== "quiz" && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 900, background: "#0d0d0d", borderTop: "1px solid #1a1a1a", display: "flex", zIndex: 100 }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ flex: 1, padding: "10px 4px 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative" }}>
              <div style={{ color: page === n.id ? "#c8f04e" : "#444" }}><Icon d={n.icon} size={20} /></div>
              <div style={{ fontSize: 9, fontWeight: 600, color: page === n.id ? "#c8f04e" : "#333", letterSpacing: 0.5 }}>{n.label}</div>
              {page === n.id && <div style={{ width: 20, height: 2, background: "#c8f04e", borderRadius: 1, position: "absolute", bottom: 0 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
