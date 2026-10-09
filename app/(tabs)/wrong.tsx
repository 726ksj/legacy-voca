import { View } from "react-native";
import EmptyState from "../../components/EmptyState";
import ScreenHeader from "../../components/ScreenHeader";

export default function WrongAnswersScreen() {
  return (
    <View className="flex-1 bg-blush">
      <ScreenHeader title="오답노트" />
      <EmptyState
        icon="alert-circle-outline"
        title="오답노트 준비 중"
        description="틀린 문제를 모아보는 기능을 준비하고 있어요"
      />
    </View>
  );
}
