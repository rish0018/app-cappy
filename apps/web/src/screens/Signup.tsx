import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, Divider, Input, SSOButton } from "@cappy/ui";
import { isAuthRateLimitError, signInWithOAuth, signUp } from "@cappy/api";
import logoMark from "../assets/logo-mark-circular.png";
import sceneCuriosityDesk from "../assets/scene_curiosity_desk.png";
import { scaleIn, scaleInReduced } from "../components/motion";

const MIN_PASSWORD_LENGTH = 8;

/**
 * Signup screen. Brand voice rule (docs/AI_project_bible.md §3/§21): error
 * copy stays calm and encouraging, never "Incorrect" or "Failed".
 */
export function Signup() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const step = reduced ? scaleInReduced : scaleIn;

  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [checkEmail, setCheckEmail] = React.useState(false);
  const [pendingProvider, setPendingProvider] = React.useState<"password" | "google" | "apple" | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCheckEmail(false);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Let's make that password a little longer   at least ${MIN_PASSWORD_LENGTH} characters keeps your account safe.`);
      return;
    }

    setPendingProvider("password");
    try {
      const session = await signUp({ email, password, displayName: displayName || email.split("@")[0] || email });
      if (session) {
        navigate("/onboarding");
      } else {
        // No session back means Supabase requires email confirmation before
        // sign-in   the account exists, but signing in now would just throw
        // "Email not confirmed". Tell the user what to do next instead of
        // silently pushing them into a screen that isn't actually signed in.
        setCheckEmail(true);
      }
    } catch (err) {
      setError(
        isAuthRateLimitError(err)
          ? "We're sending a lot of emails right now   please wait a few minutes and try again."
          : "We couldn't create your account just yet. Let's try that once more.",
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
      navigate("/onboarding");
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
            <h1 className="font-display text-2xl font-bold text-primary-700 mb-sm">Create your account</h1>
            <p className="text-base text-neutral-600">Learn the ASL alphabet at your own pace, starting today.</p>
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
              label="Name"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
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
              autoComplete="new-password"
              required
              hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error ? (
              <p role="alert" className="text-sm text-error-700 bg-error-100 rounded-md px-md py-sm">
                {error}
              </p>
            ) : null}

            {checkEmail ? (
              <p role="status" className="text-sm text-primary-700 bg-primary-100 rounded-md px-md py-sm">
                Almost there! We've sent a confirmation link to {email || "your email"}   open it to finish
                setting up your account, then come back and sign in.
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              className="w-full text-base"
              disabled={pendingProvider !== null}
            >
              {pendingProvider === "password" ? "Creating your account…" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-600">
            Already learning with Cappy?{" "}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
