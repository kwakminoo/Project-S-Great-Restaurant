"use client";

import { useEffect, useRef, useState } from "react";
import { SEOUL_CENTER } from "@/lib/mock-data";

const KAKAO_SDK = "https://dapi.kakao.com/v2/maps/sdk.js";

type KakaoMapProps = {
  className?: string;
};

function loadKakaoSdk(appKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve();
      return;
    }

    const existing = document.getElementById("kakao-map-sdk");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("카카오맵 SDK 로드 실패")),
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-map-sdk";
    script.src = `${KAKAO_SDK}?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("카카오맵 SDK 로드 실패"));
    document.head.appendChild(script);
  });
}

export function KakaoMap({ className }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ relayout: () => void } | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">(
    "loading",
  );

  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY?.trim();
    if (!appKey) {
      setStatus("missing");
      return;
    }

    let cancelled = false;

    loadKakaoSdk(appKey)
      .then(() => {
        if (cancelled || !containerRef.current || !window.kakao) return;

        window.kakao.maps.load(() => {
          if (cancelled || !containerRef.current || !window.kakao) return;

          const center = new window.kakao.maps.LatLng(
            SEOUL_CENTER.lat,
            SEOUL_CENTER.lng,
          );
          // level 8 ≈ 서울 전역이 한눈에 들어오는 배율
          const map = new window.kakao.maps.Map(containerRef.current, {
            center,
            level: 8,
          });
          mapRef.current = map;
          setStatus("ready");
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onResize = () => mapRef.current?.relayout();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      <div ref={containerRef} className="absolute inset-0" aria-label="서울 지도" />

      {status !== "ready" && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #c5d8e8 0%, #dfe9f2 40%, #b7c9d9 100%)",
          }}
        >
          {/* 서울 실루엣 느낌의 플레이스홀더 격자 */}
          <svg
            className="absolute inset-0 h-full w-full opacity-30"
            aria-hidden
          >
            <defs>
              <pattern
                id="map-grid"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="#4a667a"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
            <ellipse
              cx="50%"
              cy="46%"
              rx="28%"
              ry="22%"
              fill="none"
              stroke="#3d5a6c"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <circle cx="50%" cy="48%" r="5" fill="#fd9f28" />
          </svg>

          <div className="absolute left-1/2 top-1/2 w-[min(90%,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/90 px-5 py-4 text-center shadow-[var(--shadow)] backdrop-blur-sm">
            <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
              서울 전역 지도
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {status === "missing" && (
                <>
                  <code className="rounded bg-surface-soft px-1.5 py-0.5 text-xs">
                    NEXT_PUBLIC_KAKAO_MAP_APP_KEY
                  </code>
                  를 <code className="text-xs">.env.local</code>에 넣으면
                  카카오맵이 여기에 표시됩니다.
                </>
              )}
              {status === "loading" && "카카오맵을 불러오는 중…"}
              {status === "error" &&
                "지도를 불러오지 못했습니다. 앱 키와 도메인 설정을 확인해 주세요."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
