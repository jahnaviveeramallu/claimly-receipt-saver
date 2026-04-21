import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AuthFormProps {
  mode: "login" | "signup";
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const isSignup = mode === "signup";

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup && form.password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: form.name },
          },
        });
        if (error) throw error;
        toast.success("Welcome to Claimly!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left – form */}
      <div className="flex flex-col p-6 md:p-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                {isSignup ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-muted-foreground">
                {isSignup
                  ? "Start recovering refunds in under 2 minutes."
                  : "Log in to manage your receipts and claims."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" className="h-11 rounded-xl" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="h-11 rounded-xl" />
              </div>
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input id="confirm" type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" className="h-11 rounded-xl" />
                </div>
              )}

              <Button type="submit" variant="hero" size="lg" disabled={loading} className="w-full">
                {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {isSignup ? (
                <>Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link></>
              ) : (
                <>New to Claimly? <Link to="/signup" className="text-primary font-semibold hover:underline">Create an account</Link></>
              )}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right – brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-brand">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white, transparent 50%), radial-gradient(circle at 70% 70%, white, transparent 50%)" }} />
        <div className="relative m-auto max-w-md p-10 text-white space-y-6">
          <h2 className="font-display text-4xl font-bold leading-tight">Recover every dollar you're owed.</h2>
          <p className="text-lg opacity-90">Claimly automatically tracks your receipts, warranties and returns — and writes the claim emails for you.</p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="glass rounded-2xl p-4 text-center text-foreground">
              <div className="font-display text-2xl font-bold text-gradient-brand">$1.2M</div>
              <div className="text-xs text-muted-foreground mt-1">Recovered</div>
            </div>
            <div className="glass rounded-2xl p-4 text-center text-foreground">
              <div className="font-display text-2xl font-bold text-gradient-brand">12k+</div>
              <div className="text-xs text-muted-foreground mt-1">Claims sent</div>
            </div>
            <div className="glass rounded-2xl p-4 text-center text-foreground">
              <div className="font-display text-2xl font-bold text-gradient-brand">4.9★</div>
              <div className="text-xs text-muted-foreground mt-1">User rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
