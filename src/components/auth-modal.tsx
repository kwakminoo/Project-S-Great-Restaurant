"use client";

import { useEffect, useId, useState } from "react";

type AuthMode = "login" | "signup";

type AuthModalProps = {
  open: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
};

export function AuthModal({
  open,
  initialMode = "login",
  onClose,
}: AuthModalProps) {
  const titleId = useId();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-[var(--shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            id={titleId}
            className="font-[family-name:var(--font-display)] text-xl font-semibold"
          >
            {mode === "login" ? "로그인" : "회원가입"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted transition hover:text-foreground"
            aria-label="닫기"
          >
            닫기
          </button>
        </div>

        <div className="mt-4 flex gap-2 rounded-xl bg-surface-soft p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === "login"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === "signup"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            회원가입
          </button>
        </div>

        <form
          className="mt-5 flex flex-col gap-3"
          onSubmit={(e) => e.preventDefault()}
        >
          {mode === "signup" && (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">닉네임</span>
              <input
                type="text"
                name="nickname"
                placeholder="닉네임"
                className="rounded-xl border border-border bg-surface-soft px-3.5 py-2.5 outline-none focus:border-accent"
              />
            </label>
          )}
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">이메일</span>
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              className="rounded-xl border border-border bg-surface-soft px-3.5 py-2.5 outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">비밀번호</span>
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              className="rounded-xl border border-border bg-surface-soft px-3.5 py-2.5 outline-none focus:border-accent"
            />
          </label>
          {mode === "signup" && (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">비밀번호 확인</span>
              <input
                type="password"
                name="passwordConfirm"
                placeholder="비밀번호 확인"
                className="rounded-xl border border-border bg-surface-soft px-3.5 py-2.5 outline-none focus:border-accent"
              />
            </label>
          )}

          <button
            type="submit"
            className="mt-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            {mode === "login" ? "로그인" : "가입하기"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          인증 기능은 곧 연결될 예정입니다.
        </p>
      </div>
    </div>
  );
}
