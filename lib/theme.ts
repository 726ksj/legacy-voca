// 화면 전반에서 쓰는 색상. 값은 tailwind.config.js와 같게 유지한다(NativeWind
// 클래스를 못 쓰는 곳: 그라데이션, 탭바, 네비게이션 헤더, 아이콘 색 등).
export const colors = {
  brand: "#e27295",
  brandDark: "#c9557b",
  blush: "#fef0f5",
  berry: "#90243b",
  cream: "#fde2b9",
  line: "#f6dde5",
  ink: "#3a1b25",
  inkSoft: "#8c6b76",
  inkMuted: "#b9a3ab",
} as const;

// 로고 아이콘의 분홍 그라데이션.
export const brandGradient = ["#eb89a8", "#df6e92"] as const;
