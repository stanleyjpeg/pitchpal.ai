import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('Check your email for login link!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-3 rounded border w-80 mb-4"
      />
      <button
        disabled={loading}
        onClick={signIn}
        className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700"
      >
        {loading ? 'Sending...' : 'Send Magic Link'}
      </button>
    </div>
  );
}
