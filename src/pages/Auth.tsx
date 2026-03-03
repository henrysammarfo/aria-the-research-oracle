import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

type Mode = "login" | "signup" | "forgot";

const Auth = () => {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleLogin = async () => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) toast.error(error.message);
  };

  const handleSignup = async () => {
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split("@")[0] },
        emailRedirectTo: window.location.origin,
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for a verification link");
      setMode("login");
    }
  };

  const handleForgot = async () => {
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") handleLogin();
    else if (mode === "signup") handleSignup();
    else handleForgot();
  };

  const titles = { login: "Welcome back", signup: "Create account", forgot: "Reset password" };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-4"
      >
        <Link to="/" className="block text-center mb-8">
          <span className="font-bold tracking-[0.3em] uppercase" style={{ fontSize: 18, color: "#fff" }}>
            ARIA
          </span>
        </Link>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h1 className="text-lg font-semibold mb-6" style={{ color: "#fff" }}>
            {titles[mode]}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <InputField
                icon={<User size={15} />}
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={setDisplayName}
              />
            )}

            <InputField
              icon={<Mail size={15} />}
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
              required
            />

            {mode !== "forgot" && (
              <div className="relative">
                <InputField
                  icon={<Lock size={15} />}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={setPassword}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              style={{
                padding: "12px",
                fontSize: 14,
                background: "#fff",
                color: "#000",
              }}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-2 text-center" style={{ fontSize: 13 }}>
            {mode === "login" && (
              <>
                <button onClick={() => setMode("forgot")} style={{ color: "rgba(255,255,255,0.4)" }}>
                  Forgot password?
                </button>
                <button onClick={() => setMode("signup")} style={{ color: "rgba(255,255,255,0.4)" }}>
                  Don't have an account? <span style={{ color: "rgba(255,255,255,0.7)" }}>Sign up</span>
                </button>
              </>
            )}
            {mode === "signup" && (
              <button onClick={() => setMode("login")} style={{ color: "rgba(255,255,255,0.4)" }}>
                Already have an account? <span style={{ color: "rgba(255,255,255,0.7)" }}>Sign in</span>
              </button>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("login")} style={{ color: "rgba(255,255,255,0.4)" }}>
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

function InputField({
  icon,
  type,
  placeholder,
  value,
  onChange,
  required,
  minLength,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl"
      style={{
        padding: "12px 16px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.3)" }}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="flex-1 bg-transparent outline-none text-sm"
        style={{ color: "#fff" }}
      />
    </div>
  );
}

export default Auth;
