import React, { useState, useEffect } from "react";
import { StatusBar, View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TaskProvider } from "./src/store/TaskContext";
import HomeScreen from "./src/screens/HomeScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { UserService } from "./src/utils/user";
import { theme } from "./src/theme";

export default function App() {
  const [userName, setUserName] = useState<string | null | undefined>(
    undefined,
  ); // undefined = loading

  useEffect(() => {
    UserService.getName().then((name) => setUserName(name)); // null = not set yet
  }, []);

  // Still loading from AsyncStorage
  if (userName === undefined) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={theme.colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />
      {userName === null ? (
        // First launch — show onboarding
        <OnboardingScreen onDone={(name) => setUserName(name)} />
      ) : (
        // Returning user — show the app with greeting
        <TaskProvider>
          <HomeScreen
            userName={userName}
            onLogout={async () => {
              await UserService.clearName();
              setUserName(null);
            }}
          />
        </TaskProvider>
      )}
    </SafeAreaProvider>
  );
}
