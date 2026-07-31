import { MapHome } from "@/components/map-home";

// 요청 시점에 env를 읽어 정적 빌드에 빈 키가 박히지 않게 함
export const dynamic = "force-dynamic";

export default function Home() {
  const kakaoMapAppKey =
    process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY?.trim() ?? "";

  return <MapHome kakaoMapAppKey={kakaoMapAppKey} />;
}
