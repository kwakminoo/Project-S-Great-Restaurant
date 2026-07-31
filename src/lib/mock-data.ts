export type CategoryId =
  | "recent"
  | "korean"
  | "chinese"
  | "japanese"
  | "western"
  | "cafe";

export type ReviewRestaurant = {
  id: string;
  name: string;
  location: string;
  thumbnail: string;
  category: Exclude<CategoryId, "recent">;
  lat: number;
  lng: number;
};

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "recent", label: "최근 리뷰 맛집" },
  { id: "korean", label: "한식" },
  { id: "chinese", label: "중식" },
  { id: "japanese", label: "일식" },
  { id: "western", label: "양식" },
  { id: "cafe", label: "카페" },
];

/** 최근 리뷰가 달린 음식점 목업 (API 연동 전) */
export const RECENT_REVIEW_RESTAURANTS: ReviewRestaurant[] = [
  {
    id: "1",
    name: "광화문국밥",
    location: "종로구 세종로",
    thumbnail:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=400&fit=crop",
    category: "korean",
    lat: 37.572,
    lng: 126.9769,
  },
  {
    id: "2",
    name: "연남동 짜장면",
    location: "마포구 연남동",
    thumbnail:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop",
    category: "chinese",
    lat: 37.5662,
    lng: 126.9254,
  },
  {
    id: "3",
    name: "스시하루",
    location: "강남구 역삼동",
    thumbnail:
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=400&h=400&q=80",
    category: "japanese",
    lat: 37.5007,
    lng: 127.0365,
  },
  {
    id: "4",
    name: "이태원 파스타",
    location: "용산구 이태원동",
    thumbnail:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop",
    category: "western",
    lat: 37.5345,
    lng: 126.9946,
  },
  {
    id: "5",
    name: "성수 브루잉",
    location: "성동구 성수동",
    thumbnail:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
    category: "cafe",
    lat: 37.5446,
    lng: 127.0559,
  },
  {
    id: "6",
    name: "을지로 칼국수",
    location: "중구 을지로",
    thumbnail:
      "https://images.unsplash.com/photo-1496116218417-1a781b1c416f?w=400&h=400&fit=crop",
    category: "korean",
    lat: 37.5663,
    lng: 126.991,
  },
  {
    id: "7",
    name: "홍대 라멘",
    location: "마포구 서교동",
    thumbnail:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
    category: "japanese",
    lat: 37.5563,
    lng: 126.9236,
  },
  {
    id: "8",
    name: "북촌 티하우스",
    location: "종로구 계동",
    thumbnail:
      "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=400&fit=crop",
    category: "cafe",
    lat: 37.5796,
    lng: 126.986,
  },
  {
    id: "9",
    name: "잠실 스테이크",
    location: "송파구 잠실동",
    thumbnail:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop",
    category: "western",
    lat: 37.5133,
    lng: 127.1001,
  },
  {
    id: "10",
    name: "신촌 마라탕",
    location: "서대문구 창천동",
    thumbnail:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=500&fit=crop",
    category: "chinese",
    lat: 37.5598,
    lng: 126.9425,
  },
];

export const ADS = [
  {
    id: "a1",
    title: "이번 주 성수 카페 투어",
    subtitle: "신규 오픈 스팟만 모았어요",
    tone: "#1f8a70",
  },
  {
    id: "a2",
    title: "한강뷰 맛집 특집",
    subtitle: "저녁 노을과 함께하는 한 끼",
    tone: "#2b6cb0",
  },
  {
    id: "a3",
    title: "직장인 점심 맛집",
    subtitle: "을지로·강남 빠른 웨이팅",
    tone: "#c05621",
  },
];

/** 서울시청 중심 */
export const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };
