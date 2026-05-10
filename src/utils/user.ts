import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_NAME_KEY = "@todo_app_username";

export const UserService = {
  async getName(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(USER_NAME_KEY);
    } catch {
      return null;
    }
  },

  async saveName(name: string): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_NAME_KEY, name.trim());
    } catch (e) {
      console.error("Failed to save user name:", e);
    }
  },

  async clearName(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_NAME_KEY);
    } catch (e) {
      console.error("Failed to clear user name:", e);
    }
  },
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
};

export const getGreetingEmoji = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "☀️";
  if (hour >= 12 && hour < 17) return "🌤️";
  if (hour >= 17 && hour < 21) return "🌆";
  return "🌙";
};
