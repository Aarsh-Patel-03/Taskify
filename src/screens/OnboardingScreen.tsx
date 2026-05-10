import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";
import { UserService } from "../utils/user";
import { NotificationService } from "../utils/notifications";

interface OnboardingScreenProps {
  onDone: (name: string) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onDone }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      setError("Please enter your name to continue");
      shake();
      return;
    }
    await UserService.saveName(name.trim());
    await NotificationService.requestPermission();
    onDone(name.trim());
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.top}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.appIcon}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Taskify</Text>
          <Text style={styles.tagline}>Your personal task companion</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.welcomeTitle}>Welcome! 👋</Text>
          <Text style={styles.welcomeSubtitle}>What should we call you?</Text>

          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError("");
              }}
              placeholder="Enter your name..."
              placeholderTextColor={theme.colors.textMuted}
              autoFocus
              maxLength={30}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </Animated.View>

          <TouchableOpacity style={styles.btn} onPress={handleContinue}>
            <Text style={styles.btnText}>Let's get started →</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  inner: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: "center",
    gap: theme.spacing.xl,
  },
  top: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  appIcon: {
    width: 72,
    height: 72,
    marginBottom: theme.spacing.sm,
    borderRadius: 18,
  },
  appName: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  welcomeTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    color: theme.colors.text,
  },
  welcomeSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.xs,
    marginTop: 6,
  },
  btn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  btnText: {
    color: theme.colors.bg,
    fontSize: theme.fontSize.md,
    fontWeight: "800",
  },
});

export default OnboardingScreen;
