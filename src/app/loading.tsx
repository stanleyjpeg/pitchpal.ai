export default function Loading() {
  return (
    <div className="min-h-screen w-full grid place-items-center p-12">
      <div className="flex items-center gap-3 text-zinc-600">
        <span className="inline-block h-3 w-3 rounded-full bg-zinc-400 animate-pulse" />
        <span className="inline-block h-3 w-3 rounded-full bg-zinc-400 animate-pulse [animation-delay:150ms]" />
        <span className="inline-block h-3 w-3 rounded-full bg-zinc-400 animate-pulse [animation-delay:300ms]" />
        <span className="ml-2">Loading...</span>
      </div>
    </div>
  );
}


