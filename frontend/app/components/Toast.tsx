interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
}

export default function Toast({ message, type = "info" }: ToastProps) {
  if (!message) return null;
  const colors: Record<string, string> = {
    success: "bg-green-100 border-green-400 text-green-800",
    error:   "bg-red-100 border-red-400 text-red-800",
    info:    "bg-gray-100 border-gray-400 text-gray-800",
  };
  return (
    <div className={`border px-4 py-3 text16 ${colors[type]}`} role="alert">
      {message}
    </div>
  );
}
