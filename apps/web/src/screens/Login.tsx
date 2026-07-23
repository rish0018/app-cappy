import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, Divider, Input, SSOButton } from "@cappy/ui";
import { signInWithOAuth, signInWithPassword } from "@cappy/api";
import logoMark from "../assets/logo-mark-circular.png";
import sceneCuriosityDesk from "../assets/scene_curiosity_desk.png";
import { scaleIn, scaleInReduced } from "../components/motion";

/**
 * Login screen. Brand voice rule (docs/AI_project_bible.md §3/§21): error
 * copy stays calm and encouraging, never "Incorrect" or "Failed".
 */
export function Login() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const step = reduced ? scaleInReduced : scaleIn;

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = React.useState<"password" | "google" | "apple" | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPendingProvider("password");
    try {
      await signInWithPassword({ email, password });
      navigate("/dashboard");
    } catch {
      setError(
        "We couldn't sign you in with those details. Double-check your email and password and give it another go.",
      );
    } finally {
      setPendingProvider(null);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setError(null);
    setPendingProvider(provider);
    try {
      await signInWithOAuth(provider);
      navigate("/dashboard");
    } catch {
      setError(
        `We couldn't connect to ${provider === "google" ? "Google" : "Apple"} just now. Mind trying again in a moment?`,
      );
    } finally {
      setPendingProvider(null);
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-primary-50 bg-cover bg-center px-lg py-2xl"
      style={{ backgroundImage: `url(${sceneCuriosityDesk})` }}
    >
      <div className="absolute inset-0 bg-white/70" aria-hidden="true" />
      <motion.div className="relative max-w-md w-full" initial="hidden" animate="visible" variants={step}>
        <Card variant="feature" className="flex flex-col gap-xl">
          <div className="text-center">
            <img src={logoMark} alt="" aria-hidden="true" className="h-14 w-14 rounded-full mx-auto mb-lg" />
            <h1 className="font-display text-2xl font-bold text-primary-700 mb-sm">Welcome back</h1>
            <p className="text-base text-neutral-600">Pick up right where you left off.</p>
          </div>

          <div className="flex flex-col gap-sm">
            <SSOButton
              provider="google"
              disabled={pendingProvider !== null}
              onClick={() => handleOAuth("google")}
            />
            <SSOButton
              provider="apple"
              disabled={pendingProvider !== null}
              onClick={() => handleOAuth("apple")}
            />
          </div>

          <Divider label="or continue with" />

          <form className="flex flex-col gap-lg" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error ? (
              <p role="alert" className="text-sm text-error-700 bg-error-100 rounded-md px-md py-sm">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              className="w-full text-base"
              disabled={pendingProvider !== null}
            >
              {pendingProvider === "password" ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-600">
            New to Cappy?{" "}
            <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
              Create an account
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
