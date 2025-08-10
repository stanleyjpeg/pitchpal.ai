
export default function WaitlistPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50 px-2 sm:px-4">
      <div className="bg-white/90 dark:bg-gray-900/90 p-8 sm:p-10 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100 dark:border-gray-800 transition-shadow hover:shadow-2xl backdrop-blur">
        {/* Logo */}
        <img src="/logo.svg" alt="PitchPal Logo" className="mx-auto w-10 mb-4 drop-shadow-sm" />

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          Join the PitchPal Waitlist
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-base sm:text-lg font-medium">
          Be the first to try <span className="text-indigo-600 dark:text-indigo-400 font-semibold">AI-powered voice & video pitches</span> for your products.
        </p>

        {/* Form */}
        <form
          action="https://formspree.io/f/mqalgnqv"
          method="POST"
          className="space-y-4"
          noValidate
        >
          {/* Honeypot field for spam prevention */}
          <input type="text" name="_gotcha" style={{ display: "none" }} autoComplete="off" />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 text-base border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition placeholder:text-gray-400 dark:bg-gray-800 dark:text-white"
            aria-label="Email address"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg shadow hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Join Waitlist
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-5 select-none">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
