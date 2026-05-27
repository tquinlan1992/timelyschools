export function Toast({
  message,
  variant = "default",
}: {
  message: string;
  variant?: "default" | "error";
}) {
  return <div className={`toast ${variant === "error" ? "error" : ""}`}>{message}</div>;
}
