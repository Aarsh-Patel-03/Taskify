import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  async requestPermission(): Promise<boolean> {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  },

  async scheduleTaskReminder(
    taskId: string,
    taskTitle: string,
    reminderTime: Date,
  ): Promise<string | null> {
    try {
      const granted = await NotificationService.requestPermission();
      if (!granted) return null;

      if (reminderTime <= new Date()) return null;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Task Reminder",
          body: `Time to do: ${taskTitle}`,
          data: { taskId },
          sound: true,
        },
        trigger: reminderTime, // plain Date object — works on all versions
      });
      return id;
    } catch (e) {
      console.error("Failed to schedule notification:", e);
      return null;
    }
  },

  async cancelReminder(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.error("Failed to cancel notification:", e);
    }
  },

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
