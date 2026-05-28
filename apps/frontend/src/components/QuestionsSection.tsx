"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "./Toaster";
import type { ProductQuestion, ProductAnswer } from "@/lib/types";

export default function QuestionsSection({
  productId,
  initialQuestions,
}: {
  productId: string;
  initialQuestions: ProductQuestion[];
}) {
  const { user, accessToken } = useAuth();
  const [questions, setQuestions] = useState(initialQuestions);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [answerOpen, setAnswerOpen] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [busy, setBusy] = useState(false);

  const askQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setBusy(true);
    try {
      const { question } = await api.post<{ question: ProductQuestion }>(
        "/api/account/questions",
        { productId, question: text },
        { token: accessToken }
      );
      setQuestions((q) => [{ ...question, answers: [] }, ...q]);
      setOpen(false);
      setText("");
      toast("Question posted", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  const postAnswer = async (questionId: string) => {
    if (!accessToken || !answerText.trim()) return;
    setBusy(true);
    try {
      const { answer } = await api.post<{ answer: ProductAnswer }>(
        "/api/account/answers",
        { questionId, answer: answerText },
        { token: accessToken }
      );
      setQuestions((qs) => qs.map((q) => (q.id === questionId ? { ...q, answers: [...q.answers, answer] } : q)));
      setAnswerText("");
      setAnswerOpen(null);
      toast("Answer posted", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={{ marginTop: "4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Questions & answers ({questions.length})</h2>
        {user && !open && (
          <button className="btn-secondary" onClick={() => setOpen(true)}>Ask a question</button>
        )}
        {!user && <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Sign in to ask</span>}
      </div>

      {open && (
        <form onSubmit={askQuestion} className="glass" style={{ padding: "1.5rem", borderRadius: 12, marginBottom: "1.5rem" }}>
          <textarea
            className="form-input"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            minLength={5}
            maxLength={500}
            placeholder="Ask anything about this product…"
          />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="submit" className="btn-primary" disabled={busy}>Post question</button>
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}

      {questions.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>No questions yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {questions.map((q) => (
            <article key={q.id} className="glass" style={{ padding: "1.25rem", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ background: "var(--accent-light)", color: "var(--accent-color)", width: 28, height: 28, borderRadius: 6, display: "grid", placeItems: "center", fontWeight: 700 }}>Q</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, marginBottom: 4 }}>{q.question}</p>
                  <small style={{ color: "var(--text-muted)" }}>— {q.userName}</small>
                </div>
              </div>
              {q.answers.length > 0 && (
                <div style={{ marginTop: 12, paddingLeft: 40, display: "grid", gap: 10 }}>
                  {q.answers.map((a) => (
                    <div key={a.id} style={{ display: "flex", gap: 12 }}>
                      <div style={{ background: a.isStaff ? "var(--success-bg)" : "var(--bg-glass-light)", color: a.isStaff ? "var(--success)" : "var(--text-secondary)", width: 28, height: 28, borderRadius: 6, display: "grid", placeItems: "center", fontWeight: 700 }}>A</div>
                      <div>
                        <p style={{ color: "var(--text-secondary)" }}>{a.answer}</p>
                        <small style={{ color: "var(--text-muted)" }}>— {a.userName}{a.isStaff ? " · staff" : ""}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {user && (
                <div style={{ marginTop: 12, paddingLeft: 40 }}>
                  {answerOpen === q.id ? (
                    <div>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Write an answer…"
                      />
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button className="btn-primary" onClick={() => postAnswer(q.id)} disabled={busy}>Post answer</button>
                        <button className="btn-secondary" onClick={() => { setAnswerOpen(null); setAnswerText(""); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn-secondary" style={{ padding: "0.4rem 0.9rem", fontSize: "0.8rem" }} onClick={() => setAnswerOpen(q.id)}>
                      Answer
                    </button>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
