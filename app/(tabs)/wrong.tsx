import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStatusBar } from "../../lib/useStatusBar";

export default function WrongAnswersScreen() {
  useStatusBar("dark");
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center justify-center bg-blush px-10"
      style={{ paddingTop: insets.top }}
    >
      <View className="h-20 w-20 items-center justify-center rounded-full bg-cream">
        <Ionicons name="alert-circle-outline" size={40} color="#90243b" />
      </View>
      <Text className="mt-4 text-base font-bold text-ink">오답노트 준비 중</Text>
      <Text className="mt-1.5 text-center text-sm text-ink-soft">
        틀린 문제를 모아보는 기능을 준비하고 있어요
      </Text>
    </View>
  );
}
