import { useState } from "react";
import { AlertCircle } from "lucide-react";

export default function Login({ onLogin, onSwitchToRegister }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", identifier);
      formData.append("password", password);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await res.json();
      onLogin(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-7">
        <h2 className="text-xl font-semibold text-stone-900 mb-1">
          Welcome back
        </h2>
        <p className="text-stone-500 text-sm">Sign in to track your matches</p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Email or Username
          </label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-lg py-2 px-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-colors text-sm"
            placeholder="player@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-lg py-2 px-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-colors text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !identifier || !password}
          className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-[#EFE4D2] font-medium py-2.5 px-4 rounded-lg transition-colors text-sm mt-2"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-500">
        Don't have an account?{" "}
        <button
          onClick={onSwitchToRegister}
          className="text-stone-800 font-medium hover:underline"
        >
          Register here
        </button>
      </p>
    </div>
  );
}
