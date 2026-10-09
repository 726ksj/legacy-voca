import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";

// 화면이 포커스될 때마다 상태바 글자색을 맞춘다. 분홍 그라데이션 헤더 위에서는
// "light"(흰 글자), 연분홍 배경 위에서는 "dark"(진한 글자)를 쓴다.
export function useStatusBar(style: "light" | "dark") {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(style);
    }, [style]),
  );
}
