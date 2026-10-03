import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WrongAnswersScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center justify-center bg-white px-10"
      style={{ paddingTop: insets.top }}
    >
      <Ionicons name="alert-circle-outline" size={40} color="#d4d4d8" />
      <Text className="mt-4 text-base font-bold text-zinc-400">오답노트 준비 중</Text>
      <Text className="mt-1.5 text-center text-sm text-zinc-400">
        틀린 문제를 모아보는 기능을 준비하고 있어요
      </Text>
    </View>
  );
}
