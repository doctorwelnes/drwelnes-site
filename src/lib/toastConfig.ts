import type { ExternalToast } from "sonner";

export const toastStyles = {
  default: {
    background: "#16181d",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
  },
  success: {
    background: "#16181d",
    border: "1px solid rgba(34,197,94,0.3)",
    color: "#fff",
  },
  error: {
    background: "#16181d",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#a1a1aa",
  },
  warning: {
    background: "#16181d",
    border: "1px solid rgba(249,87,0,0.2)",
    color: "#fff",
  },
  orange: {
    background: "#16181d",
    border: "1px solid rgba(249,87,0,0.2)",
    color: "#fff",
  },
} as const;

export const toastOptions = {
  success: {
    style: toastStyles.success,
  } satisfies ExternalToast,
  error: {
    style: toastStyles.error,
  } satisfies ExternalToast,
  warning: {
    style: toastStyles.warning,
  } satisfies ExternalToast,
  default: {
    style: toastStyles.default,
  } satisfies ExternalToast,
} as const;
