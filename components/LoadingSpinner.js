export default function LoadingSpinner({ text = 'Loading...', fullScreen = true }) {
  return (
    <div className={`${fullScreen ? 'min-h-screen' : ''} flex flex-col items-center justify-center py-10`}>
      {/* Animated loader */}
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
        <div className="absolute h-8 w-8 rounded-full border-4 border-transparent border-l-primary-400 animate-[spin_1.2s_linear_infinite]" />
      </div>
      {text && (
        <div className="mt-4 flex items-center gap-2 text-gray-600 font-medium">
          <span>{text}</span>
          <span className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.2s]" />
            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.1s]" />
            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
          </span>
        </div>
      )}
    </div>
  );
}
