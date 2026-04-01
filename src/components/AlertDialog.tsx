
interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  theme: "light" | "dark";
}

export function AlertDialog({ isOpen, title, message, onClose, theme }: AlertDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-sm p-6 rounded-lg shadow-xl transition-colors ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className={`mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          {message}
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
