import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      navigate("/dashboard");
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <div className="text-center">
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            Invalid or expired reset link.
          </p>
          <Link to="/auth" className="mt-4 inline-block" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

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
            Set new password
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <div
                className="flex items-center gap-3 rounded-xl"
                style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Lock size={15} style={{ color: "rgba(255,255,255,0.3)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "#fff" }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting || password.length < 6}
              className="flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              style={{ padding: "12px", fontSize: 14, background: "#fff", color: "#000" }}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Update password
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
