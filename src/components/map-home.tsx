"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { KakaoMap } from "@/components/kakao-map";
import { AuthModal } from "@/components/auth-modal";
import Image from "next/image";
import {
  CATEGORIES,
  RECENT_REVIEW_RESTAURANTS,
  type CategoryId,
  type ReviewRestaurant,
} from "@/lib/mock-data";

const CARDS_PER_PAGE = 4;
/** SSR·첫 클라이언트 렌더 공통 값. window는 useEffect에서만 읽음 */
const DEFAULT_VIEWPORT_H = 800;
const SHEET = {
  collapsed: 48,
  halfRatio: 0.48,
  fullRatio: 0.86,
} as const;

type SheetSnap = "collapsed" | "half" | "full";

function IconDirections({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 4.5 12.5H9v8h6v-8h4.5L12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPen({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m13.5 6 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.9L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMore({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m16.2 16.2 4.3 4.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m15 6-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function filterRestaurants(
  category: CategoryId,
  list: ReviewRestaurant[],
): ReviewRestaurant[] {
  if (category === "recent") return list;
  return list.filter((r) => r.category === category);
}

function snapHeight(snap: SheetSnap, viewportH: number) {
  if (snap === "collapsed") return SHEET.collapsed;
  if (snap === "half") return Math.round(viewportH * SHEET.halfRatio);
  return Math.round(viewportH * SHEET.fullRatio);
}

function nearestSnap(height: number, viewportH: number): SheetSnap {
  const targets: SheetSnap[] = ["collapsed", "half", "full"];
  let best: SheetSnap = "collapsed";
  let bestDist = Infinity;
  for (const s of targets) {
    const d = Math.abs(height - snapHeight(s, viewportH));
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return best;
}

export function MapHome() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId>("recent");
  const [snap, setSnap] = useState<SheetSnap>("collapsed");
  const [sheetH, setSheetH] = useState<number>(SHEET.collapsed);
  const [cardPage, setCardPage] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const viewportH = useRef(DEFAULT_VIEWPORT_H);
  const mapAreaRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartH = useRef<number>(SHEET.collapsed);

  const restaurants = filterRestaurants(category, RECENT_REVIEW_RESTAURANTS);
  const pageCount = Math.max(1, Math.ceil(restaurants.length / CARDS_PER_PAGE));
  const pages = Array.from({ length: pageCount }, (_, i) => {
    const slice = restaurants.slice(
      i * CARDS_PER_PAGE,
      i * CARDS_PER_PAGE + CARDS_PER_PAGE,
    );
    return slice;
  });

  useEffect(() => {
    const el = mapAreaRef.current;
    if (!el) return;

    const sync = () => {
      viewportH.current = el.clientHeight;
      setSheetH(snapHeight(snap, viewportH.current));
    };
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [snap]);

  useEffect(() => {
    setCardPage(0);
  }, [category]);

  const onHandlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      dragStartY.current = e.clientY;
      dragStartH.current = sheetH;
    },
    [sheetH],
  );

  const onHandlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      const delta = dragStartY.current - e.clientY;
      const max = snapHeight("full", viewportH.current);
      const min = SHEET.collapsed;
      const next = Math.min(max, Math.max(min, dragStartH.current + delta));
      setSheetH(next);
    },
    [dragging],
  );

  const endDrag = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    const nextSnap = nearestSnap(sheetH, viewportH.current);
    setSnap(nextSnap);
    setSheetH(snapHeight(nextSnap, viewportH.current));
  }, [dragging, sheetH]);

  const showList = sheetH > SHEET.collapsed + 24;

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      {/* 상단바: 로고 + 검색 + 길찾기 + 카테고리 + 인증 */}
      <header className="z-40 shrink-0 border-b border-border bg-surface pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-5xl px-4 py-2.5 sm:px-8">
          <div className="flex w-full items-start gap-2.5 sm:gap-3">
            <a href="/" className="shrink-0 pt-0.5" aria-label="한입 홈">
              <Image
                src="/hanip-logo.png"
                alt="한입"
                width={96}
                height={96}
                className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24"
                priority
              />
            </a>

            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-surface-soft px-3.5 py-2.5">
                  <IconSearch className="h-5 w-5 shrink-0 text-muted" />
                  <span className="sr-only">맛집 검색</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="맛집, 지역, 메뉴 검색"
                    className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted/80"
                  />
                </label>

                <button
                  type="button"
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-surface-soft px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-border/60"
                  aria-label="길찾기"
                >
                  <IconDirections className="h-5 w-5 text-accent" />
                  <span className="hidden sm:inline">길찾기</span>
                </button>

                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => openAuth("login")}
                    className="rounded-xl px-2.5 py-2 text-sm font-medium text-foreground transition hover:bg-surface-soft sm:px-3"
                  >
                    로그인
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth("signup")}
                    className="rounded-xl bg-accent px-2.5 py-2 text-sm font-semibold text-white transition hover:brightness-95 sm:px-3"
                  >
                    회원가입
                  </button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {CATEGORIES.map((c) => {
                  const active = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategory(c.id);
                        if (snap === "collapsed") {
                          setSnap("half");
                          setSheetH(snapHeight("half", viewportH.current));
                        }
                      }}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                        active
                          ? "bg-accent text-white"
                          : "bg-surface-soft text-foreground hover:bg-border/60"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div ref={mapAreaRef} className="relative min-h-0 flex-1">
        <KakaoMap />

      {/* 하단 시트 */}
      <section
        className="absolute bottom-0 left-1/2 z-30 flex w-[80%] -translate-x-1/2 flex-col bg-surface shadow-[0_-8px 32px rgba(15,23,42,0.14)]"
        style={{
          height: sheetH,
          borderTopLeftRadius: "var(--sheet-radius)",
          borderTopRightRadius: "var(--sheet-radius)",
          transition: dragging ? "none" : "height 0.28s cubic-bezier(0.22,1,0.36,1)",
        }}
        aria-label="최근 리뷰 맛집"
      >
        <div
          className="flex cursor-grab touch-none flex-col items-center px-4 pb-1 pt-2 active:cursor-grabbing"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          role="slider"
          aria-valuemin={SHEET.collapsed}
          aria-valuemax={snapHeight("full", viewportH.current)}
          aria-valuenow={sheetH}
          aria-label="시트 높이 조절"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              const order: SheetSnap[] = ["collapsed", "half", "full"];
              const i = Math.min(2, order.indexOf(snap) + 1);
              setSnap(order[i]);
              setSheetH(snapHeight(order[i], viewportH.current));
            }
            if (e.key === "ArrowDown") {
              const order: SheetSnap[] = ["collapsed", "half", "full"];
              const i = Math.max(0, order.indexOf(snap) - 1);
              setSnap(order[i]);
              setSheetH(snapHeight(order[i], viewportH.current));
            }
          }}
        >
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* 사용자 / 액션 + 리뷰 카드 */}
        <div
          className={`mx-auto flex min-h-0 w-full max-w-none flex-1 flex-col px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-opacity sm:px-6 ${
            showList ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="flex items-center justify-between gap-2 py-1">
            <p className="truncate text-sm font-semibold text-foreground">
              민우
            </p>
            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-muted transition hover:text-foreground sm:text-sm"
              >
                <IconPen className="h-4 w-4" />
                리뷰쓰기
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-muted transition hover:text-foreground sm:text-sm"
              >
                <IconStar className="h-4 w-4" />
                즐겨찾기
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-muted transition hover:text-foreground sm:text-sm"
              >
                <IconMore className="h-4 w-4" />
                더보기
              </button>
            </div>
          </div>

          <div className="mt-2 flex min-h-0 flex-1 items-stretch gap-1">
            <button
              type="button"
              aria-label="이전 카드"
              disabled={cardPage === 0}
              onClick={() => setCardPage((p) => Math.max(0, p - 1))}
              className="flex w-8 shrink-0 items-center justify-center self-center text-muted transition hover:text-foreground disabled:opacity-25"
            >
              <IconChevronLeft className="h-7 w-7" />
            </button>

            <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
              <div
                className="absolute inset-0 flex transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateX(-${cardPage * 100}%)` }}
              >
                {pages.map((pageCards, pageIdx) => (
                  <div
                    key={pageIdx}
                    className="flex h-full w-full shrink-0 gap-3 px-1"
                  >
                    {Array.from({ length: CARDS_PER_PAGE }, (_, i) => {
                      const r = pageCards[i];
                      if (!r) {
                        return (
                          <div
                            key={`empty-${pageIdx}-${i}`}
                            className="min-w-0 flex-1"
                            aria-hidden
                          />
                        );
                      }
                      return (
                        <article
                          key={r.id}
                          className="flex min-h-0 min-w-0 flex-1 flex-col"
                        >
                          <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-surface-soft">
                            {/* eslint-disable-next-line @next/next/no-img-element -- 외부 목업 썸네일 */}
                            <img
                              src={r.thumbnail}
                              alt={`${r.name} 리뷰 사진`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <h3 className="mt-2 shrink-0 truncate text-sm font-semibold leading-tight sm:text-base">
                            {r.name}
                          </h3>
                          <p className="shrink-0 truncate text-xs text-muted sm:text-sm">
                            {r.location}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-label="다음 카드"
              disabled={cardPage >= pageCount - 1}
              onClick={() =>
                setCardPage((p) => Math.min(pageCount - 1, p + 1))
              }
              className="flex w-8 shrink-0 items-center justify-center self-center text-muted transition hover:text-foreground disabled:opacity-25"
            >
              <IconChevronRight className="h-7 w-7" />
            </button>
          </div>
        </div>
      </section>
      </div>

      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}
