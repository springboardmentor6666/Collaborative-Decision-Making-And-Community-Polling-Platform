function Toast({ message, isError }) {
  if (!message) return null;

  return (
    <div
      className="
        fixed
        top-8
        right-8
        z-[100]
        translate-x-0
        opacity-100
        transition-all
        duration-500
        ease-out
      "
    >
      <div
        className={`
          flex
          items-center
          gap-3
          rounded-2xl
          border
          px-6
          py-4
          backdrop-blur-xl
          shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]
          transition-all
          duration-300

          ${
            isError
              ? `
                border-red-500/50
                bg-red-500/20
                text-red-500
              `
              : `
                border-green-500/50
                bg-green-500/20
                text-green-500
              `
          }
        `}
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