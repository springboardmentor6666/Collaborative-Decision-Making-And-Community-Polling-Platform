function Toast({ message, isError }) {
  if (!message) return null;

  return (
    <div
      className={`fixed top-8 right-8 z-[100] transition-all duration-500 ease-out transform
        ${message
          ? "translate-x-0 opacity-100"
          : "translate-x-12 opacity-0 pointer-events-none"
        }`}
    >
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-2xl
          shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]
          border backdrop-blur-xl
          ${
            isError
              ? "bg-red-500/20 border-red-500/50 text-red-100"
              : "bg-green-500/20 border-green-500/50 text-green-100"
          }`}
      >
        <span className="text-2xl drop-shadow-md">
          {isError ? "⚠️" : "✅"}
        </span>

        <p className="font-semibold tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
}

export default Toast;