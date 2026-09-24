import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";

export default function Gate() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      router.replace(session ? "/words" : "/login");
    });
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator color="#e98998" />
    </View>
  );
}
