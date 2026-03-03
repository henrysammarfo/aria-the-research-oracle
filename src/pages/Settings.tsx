import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Camera, User, Save, Sun, Moon } from "lucide-react";

const Settings = () => {
  const { user, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_url, theme_preference")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || "");
          setAvatarUrl(data.avatar_url);
          const t = (data as any).theme_preference as string | null;
          if (t === "light" || t === "dark") setTheme(t);
          localStorage.setItem("aria_theme", t || "dark");
        }
      });
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const isDark = theme === "dark";

  const c = {
    bg: isDark ? "#0A0A0A" : "#F5F5F4",
    text: isDark ? "#fff" : "#1a1a1a",
    textMuted: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)",
    textDim: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)",
    surface: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    surfaceHover: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    borderLight: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
    avatarBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    avatarBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
    iconMuted: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)",
    btnBg: isDark ? "#fff" : "#1a1a1a",
    btnText: isDark ? "#000" : "#fff",
  };

  const handleThemeToggle = async (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    localStorage.setItem("aria_theme", newTheme);
    await supabase
      .from("profiles")
      .update({ theme_preference: newTheme } as any)
      .eq("id", user.id);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Upload failed: " + uploadError.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: newUrl }).eq("id", user.id);
    if (updateError) toast.error("Failed to save avatar");
    else { setAvatarUrl(newUrl); toast.success("Avatar updated"); }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName.trim() || null }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Failed to save");
    else toast.success("Profile updated");
  };

  return (
    <div className="min-h-screen" style={{ background: c.bg }}>
      <div
        className="flex items-center gap-4 flex-shrink-0"
        style={{ padding: "12px 24px", borderBottom: `1px solid ${c.borderLight}` }}
      >
        <Link to="/dashboard" className="flex items-center gap-2 transition-colors" style={{ fontSize: 13, color: c.textDim }}>
          <ArrowLeft size={14} />
          <span>Dashboard</span>
        </Link>
        <span className="font-bold tracking-[0.2em] uppercase" style={{ fontSize: 14, color: c.text }}>Settings</span>
      </div>

      <div className="max-w-md mx-auto px-4" style={{ paddingTop: 60 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-8">
          {/* Avatar */}
          <div className="relative group">
            <div
              className="rounded-full overflow-hidden flex items-center justify-center"
              style={{ width: 96, height: 96, background: c.avatarBg, border: `2px solid ${c.avatarBorder}` }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={36} style={{ color: c.iconMuted }} />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.6)" }}
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={20} style={{ color: "rgba(255,255,255,0.8)" }} />
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>

          {/* Theme toggle */}
          <div className="w-full flex flex-col gap-2">
            <label className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: "0.1em", color: c.textDim }}>
              Theme
            </label>
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeToggle(t)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200"
                  style={{
                    padding: "12px",
                    fontSize: 13,
                    background: theme === t ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") : c.surface,
                    border: `1px solid ${theme === t ? (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)") : c.border}`,
                    color: theme === t ? c.text : c.textMuted,
                  }}
                >
                  {t === "dark" ? <Moon size={14} /> : <Sun size={14} />}
                  {t === "dark" ? "Dark" : "Light"}
                </button>
              ))}
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="w-full flex flex-col gap-2">
            <label className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: "0.1em", color: c.textDim }}>Email</label>
            <div className="rounded-xl" style={{ padding: "12px 16px", fontSize: 14, color: c.textMuted, background: c.surface, border: `1px solid ${c.borderLight}` }}>
              {user.email}
            </div>
          </div>

          {/* Display name */}
          <div className="w-full flex flex-col gap-2">
            <label className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: "0.1em", color: c.textDim }}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl bg-transparent outline-none"
              style={{ padding: "12px 16px", fontSize: 14, color: c.text, background: c.surface, border: `1px solid ${c.border}` }}
            />
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
            style={{ padding: "12px", fontSize: 14, background: c.btnBg, color: c.btnText }}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Save size={15} /> Save Changes</>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
