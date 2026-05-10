import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  PanResponder,
  Dimensions,
  Platform,
} from "react-native";
import { theme } from "../theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimePickerProps {
  value?: string;
  onChange: (iso: string | undefined) => void;
}

type Mode = "hour" | "minute";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

const buildISO = (hours: number, minutes: number): string => {
  const now = new Date();
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  if (d <= now) d.setDate(d.getDate() + 1);
  return d.toISOString();
};

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${pad(m)} ${ampm}`;
};

/**
 * Convert a touch point to an angle in degrees (0 = top/12 o'clock, clockwise).
 */
const pointToAngle = (
  cx: number,
  cy: number,
  px: number,
  py: number,
): number => {
  const rad = Math.atan2(px - cx, -(py - cy));
  return ((rad * 180) / Math.PI + 360) % 360;
};

const angleToHour12 = (deg: number): number => Math.round(deg / 30) % 12;
const angleToMinute = (deg: number): number => Math.round(deg / 6) % 60;

// ─── Clock Face ───────────────────────────────────────────────────────────────

const CLOCK_SIZE = Math.min(Dimensions.get("window").width * 0.72, 270);
const R = CLOCK_SIZE / 2; // clock radius
const TICK_R = R - 30; // radius where numbers sit

interface ClockFaceProps {
  mode: Mode;
  hour24: number;
  minute: number;
  isPM: boolean;
  onHourChange: (h24: number) => void;
  onMinuteChange: (m: number) => void;
  onModeAdvance: () => void;
}

const ClockFace: React.FC<ClockFaceProps> = ({
  mode,
  hour24,
  minute,
  isPM,
  onHourChange,
  onMinuteChange,
  onModeAdvance,
}) => {
  const layoutRef = useRef({ pageX: 0, pageY: 0 });
  const containerRef = useRef<View>(null);

  // Re-measure after modal has animated in (avoids stale coordinates on first open)
  const measureLayout = useCallback(() => {
    // Small delay so the spring animation has settled before we capture position
    setTimeout(() => {
      containerRef.current?.measureInWindow((x, y) => {
        layoutRef.current = { pageX: x, pageY: y };
      });
    }, 320);
  }, []);

  // Scale/fade in when mode changes
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scaleAnim.setValue(0.88);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 90,
        friction: 9,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
    // Re-measure whenever mode switches — the clock re-renders at the same position
    // but the animation frame means measureInWindow can briefly return 0,0
    setTimeout(() => {
      containerRef.current?.measureInWindow((x, y) => {
        layoutRef.current = { pageX: x, pageY: y };
      });
    }, 50);
  }, [mode]);

  // Keep a ref to the latest handlers so PanResponder (created once) always
  // calls the current version — avoids stale closures without recreating pan.
  const handlerRef = useRef({
    onHourChange,
    onMinuteChange,
    mode,
    isPM,
    onModeAdvance,
  });
  handlerRef.current = {
    onHourChange,
    onMinuteChange,
    mode,
    isPM,
    onModeAdvance,
  };

  const resolve = useCallback((pageX: number, pageY: number) => {
    const { pageX: ox, pageY: oy } = layoutRef.current;
    const cx = ox + R;
    const cy = oy + R;
    const angle = pointToAngle(cx, cy, pageX, pageY);
    const {
      mode: m,
      isPM: pm,
      onHourChange: oh,
      onMinuteChange: om,
    } = handlerRef.current;
    if (m === "hour") {
      const h12 = angleToHour12(angle); // 0–11 (0 means 12)
      // FIX: correct AM/PM hour conversion
      // h12=0 → display "12"; AM → hour 0, PM → hour 12
      const h24 = pm ? h12 + 12 : h12;
      oh(h24);
    } else {
      om(angleToMinute(angle));
    }
  }, []);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) =>
        resolve(e.nativeEvent.pageX, e.nativeEvent.pageY),
      onPanResponderMove: (e) =>
        resolve(e.nativeEvent.pageX, e.nativeEvent.pageY),
      // FIX: only advance from hour → minute on finger-up, not minute → hour
      onPanResponderRelease: () => handlerRef.current.onModeAdvance(),
    }),
  ).current;

  // Build tick data
  const ticks =
    mode === "hour"
      ? Array.from({ length: 12 }, (_, i) => {
          const h12 = i; // 0 means 12 o'clock position
          const h24 = isPM ? h12 + 12 : h12;
          return {
            label: String(h12 === 0 ? 12 : h12),
            value: h24,
            angle: i * 30,
          };
        })
      : Array.from({ length: 12 }, (_, i) => ({
          label: pad(i * 5),
          value: i * 5,
          angle: i * 30,
        }));

  const selectedValue = mode === "hour" ? hour24 : minute;
  const handAngleDeg =
    mode === "hour" ? ((hour24 % 12) / 12) * 360 : (minute / 60) * 360;
  const handLength = TICK_R - 4;

  // FIX: compute hand line using two absolute points instead of relying on
  // transformOrigin (unsupported in RN). We render the line from centre outward
  // by computing the endpoint and using width + a center-anchored rotation.
  //
  // The line starts at the clock centre (R, R) and points to the tick at handLength.
  // The tip circle should share the same length so the glowing end matches the
  // hand line exactly.

  const tipRad = ((handAngleDeg - 90) * Math.PI) / 180;
  const tipX = R + handLength * Math.cos(tipRad);
  const tipY = R + handLength * Math.sin(tipRad);

  return (
    <Animated.View
      style={[
        clk.wrapper,
        {
          width: CLOCK_SIZE,
          height: CLOCK_SIZE,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View
        ref={containerRef}
        style={clk.face}
        onLayout={measureLayout}
        {...pan.panHandlers}
      >
        {/* FIX: Hand rendered with correct pivot using translate-rotate-translate */}
        <View
          pointerEvents="none"
          style={[
            clk.handLine,
            {
              width: handLength,
              transform: [
                { translateX: -handLength / 2 },
                { rotate: `${handAngleDeg - 90}deg` },
                { translateX: handLength / 2 },
              ],
            },
          ]}
        />

        {/* Glowing tip */}
        <View
          pointerEvents="none"
          style={[
            clk.handTip,
            {
              left: tipX - 14,
              top: tipY - 14,
              backgroundColor: theme.colors.accent,
            },
          ]}
        />

        {/* Centre dot */}
        <View style={[clk.centre, { backgroundColor: theme.colors.accent }]} />

        {/* Tick labels */}
        {ticks.map((tick) => {
          const rad = ((tick.angle - 90) * Math.PI) / 180;
          const x = R + TICK_R * Math.cos(rad);
          const y = R + TICK_R * Math.sin(rad);
          const isSelected = tick.value === selectedValue;

          return (
            <View
              key={tick.value}
              pointerEvents="none"
              style={[
                clk.tick,
                {
                  left: x - 20,
                  top: y - 20,
                  backgroundColor: isSelected
                    ? theme.colors.accent
                    : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  clk.tickText,
                  {
                    color: isSelected
                      ? theme.colors.bg
                      : theme.colors.textSecondary,
                    fontWeight: isSelected ? "800" : "500",
                  },
                ]}
              >
                {tick.label}
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
};

const clk = StyleSheet.create({
  wrapper: { alignSelf: "center" },
  face: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2,
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    position: "relative",
    overflow: "visible",
  },
  // FIX: Positioned at clock centre with left=R, top=R-1. The translate trick
  // in the transform array handles correct pivot (see comment above).
  handLine: {
    position: "absolute",
    height: 2,
    backgroundColor: theme.colors.accent + "AA",
    top: R - 1,
    left: R,
    borderRadius: 2,
    // transformOrigin removed — unsupported in RN; handled via translate trick
  },
  handTip: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    opacity: 0.95,
  },
  centre: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    top: R - 5,
    left: R - 5,
    zIndex: 10,
  },
  tick: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tickText: {
    fontSize: 13,
  },
});

// ─── Time Display ─────────────────────────────────────────────────────────────

interface TimeDisplayProps {
  hour24: number;
  minute: number;
  mode: Mode;
  onSelectHour: () => void;
  onSelectMinute: () => void;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  hour24,
  minute,
  mode,
  onSelectHour,
  onSelectMinute,
}) => {
  const h12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "PM" : "AM";

  return (
    <View style={disp.row}>
      <TouchableOpacity
        onPress={onSelectHour}
        style={[disp.seg, mode === "hour" && disp.segActive]}
      >
        <Text style={[disp.num, mode === "hour" && disp.numActive]}>
          {pad(h12)}
        </Text>
      </TouchableOpacity>

      <Text style={disp.colon}>:</Text>

      <TouchableOpacity
        onPress={onSelectMinute}
        style={[disp.seg, mode === "minute" && disp.segActive]}
      >
        <Text style={[disp.num, mode === "minute" && disp.numActive]}>
          {pad(minute)}
        </Text>
      </TouchableOpacity>

      <Text style={disp.ampm}>{ampm}</Text>
    </View>
  );
};

const disp = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 4,
  },
  seg: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    minWidth: 74,
    alignItems: "center",
  },
  segActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentMuted,
  },
  num: {
    fontSize: 36,
    fontWeight: "700",
    color: theme.colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
  numActive: { color: theme.colors.accent },
  colon: {
    fontSize: 34,
    fontWeight: "900",
    color: theme.colors.text,
    marginHorizontal: 2,
    marginBottom: 2,
  },
  ampm: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.textMuted,
    alignSelf: "flex-end",
    marginBottom: 6,
    marginLeft: 4,
  },
});

// ─── AM / PM Toggle ───────────────────────────────────────────────────────────

interface AMPMToggleProps {
  isPM: boolean;
  onToggle: (pm: boolean) => void;
}

const AMPMToggle: React.FC<AMPMToggleProps> = ({ isPM, onToggle }) => (
  <View style={tog.wrap}>
    {(["AM", "PM"] as const).map((label) => {
      const active = (label === "PM") === isPM;
      return (
        <TouchableOpacity
          key={label}
          style={[tog.btn, active && tog.btnActive]}
          onPress={() => onToggle(label === "PM")}
        >
          <Text style={[tog.text, active && tog.textActive]}>{label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const tog = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: theme.colors.bgElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: 16,
  },
  btn: { paddingHorizontal: 28, paddingVertical: 9 },
  btnActive: { backgroundColor: theme.colors.accent },
  text: { fontSize: 14, fontWeight: "700", color: theme.colors.textMuted },
  textActive: { color: theme.colors.bg },
});

// ─── Step Dots ────────────────────────────────────────────────────────────────

const StepDots: React.FC<{ mode: Mode }> = ({ mode }) => (
  <View style={dots.row}>
    {(["hour", "minute"] as Mode[]).map((m) => (
      <View key={m} style={[dots.dot, m === mode && dots.dotActive]} />
    ))}
  </View>
);

const dots = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
  },
  dotActive: { backgroundColor: theme.colors.accent, width: 18 },
});

// ─── Main TimePicker ──────────────────────────────────────────────────────────

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("hour");

  const getInitialTime = useCallback(() => {
    const d = value ? new Date(value) : new Date();
    return { hour: d.getHours(), min: Math.floor(d.getMinutes() / 5) * 5 };
  }, [value]);

  const [selHour, setSelHour] = useState(() => getInitialTime().hour);
  const [selMin, setSelMin] = useState(() => getInitialTime().min);
  const [isPM, setIsPM] = useState(() => getInitialTime().hour >= 12);

  const slideAnim = useRef(new Animated.Value(400)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const handleOpen = () => {
    const { hour, min } = getInitialTime();
    setSelHour(hour);
    setSelMin(min);
    setIsPM(hour >= 12);
    setMode("hour");
    setOpen(true);
    slideAnim.setValue(400);
    bgAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(bgAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(bgAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setOpen(false));
  };

  const handleHourChange = useCallback((h: number) => setSelHour(h), []);
  const handleMinuteChange = useCallback((m: number) => setSelMin(m), []);

  // FIX: only advance hour → minute; do nothing when already on minute
  const handleModeAdvance = useCallback(() => {
    setMode((prev) => (prev === "hour" ? "minute" : "minute"));
    // Note: this is intentionally kept as "minute" for both to avoid jumping
    // back to hour when the user lifts their finger on the minute dial.
    // The only transition is hour → minute (one-way during drag-release).
  }, []);

  const handlePMToggle = (pm: boolean) => {
    setIsPM(pm);
    setSelHour((h) => {
      const base = h % 12;
      return pm ? base + 12 : base;
    });
  };

  const handleConfirm = () => {
    if (mode === "hour") {
      setMode("minute");
      return;
    }
    onChange(buildISO(selHour, selMin));
    handleClose();
  };

  const handleClear = () => onChange(undefined);

  const bgOpacity = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.78],
  });

  return (
    <>
      {/* Trigger */}
      <View style={s.row}>
        <TouchableOpacity
          style={[s.pill, value ? s.pillActive : null]}
          onPress={handleOpen}
          activeOpacity={0.75}
        >
          <Text style={s.pillIcon}>🔔</Text>
          <Text style={[s.pillText, value ? s.pillTextActive : null]}>
            {value ? formatTime(value) : "Set reminder time"}
          </Text>
        </TouchableOpacity>

        {value && (
          <TouchableOpacity style={s.clearBtn} onPress={handleClear}>
            <Text style={s.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal */}
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        {/* Backdrop */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "#000", opacity: bgOpacity },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Bottom sheet */}
        <Animated.View
          style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={s.handle} />

          <Text style={s.title}>Set Reminder</Text>

          <StepDots mode={mode} />

          <TimeDisplay
            hour24={selHour}
            minute={selMin}
            mode={mode}
            onSelectHour={() => setMode("hour")}
            onSelectMinute={() => setMode("minute")}
          />

          <AMPMToggle isPM={isPM} onToggle={handlePMToggle} />

          <ClockFace
            mode={mode}
            hour24={selHour}
            minute={selMin}
            isPM={isPM}
            onHourChange={handleHourChange}
            onMinuteChange={handleMinuteChange}
            onModeAdvance={handleModeAdvance}
          />

          <Text style={s.hint}>
            {mode === "hour"
              ? "Drag to select hour, then tap Next"
              : "Drag to select minute"}
          </Text>

          <View style={s.actions}>
            <TouchableOpacity style={s.cancelBtn} onPress={handleClose}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm}>
              <Text style={s.confirmText}>
                {mode === "hour" ? "Next  →" : "Set Reminder"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentMuted,
  },
  pillIcon: { fontSize: 16 },
  pillText: { fontSize: theme.fontSize.md, color: theme.colors.textMuted },
  pillTextActive: { color: theme.colors.accent, fontWeight: "600" },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: { color: theme.colors.textSecondary, fontSize: 14 },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.bgCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomWidth: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: "800",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: 10,
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgElevated,
    alignItems: "center",
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: theme.fontSize.md,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
  },
  confirmText: {
    color: theme.colors.bg,
    fontWeight: "800",
    fontSize: theme.fontSize.md,
  },
});
