import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // 빌드/런타임 모두에서 클라이언트 번들로 키가 노출되도록 명시
  env: {
    NEXT_PUBLIC_KAKAO_MAP_APP_KEY:
      process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ?? "",
  },
};

export default nextConfig;
