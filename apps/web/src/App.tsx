import * as React from "react";
import { Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { NavLayout } from "./components/NavLayout";
import { RequireAuth } from "./components/RequireAuth";
import { MascotLayer } from "./mascot/MascotLayer";
import { Loader } from "./components/Loader";
import { SettingsProvider, useSettings } from "./settings/SettingsContext";
import { Landing } from "./screens/Landing";
import { Login } from "./screens/Login";
import { Signup } from "./screens/Signup";
import { Onboarding } from "./screens/Onboarding";
import { Dashboard } from "./screens/Dashboard";
import { LessonList } from "./screens/LessonList";
import { LessonDemo } from "./screens/LessonDemo";
import { LessonPractice } from "./screens/LessonPractice";
import { LessonQuiz } from "./screens/LessonQuiz";
import { LessonReview } from "./screens/LessonReview";
import { Achievements } from "./screens/Achievements";
import { Profile } from "./screens/Profile";
import { MorseDashboard } from "./screens/morse/MorseDashboard";
import { MorseLevelList } from "./screens/morse/MorseLevelList";
import { MorseSend } from "./screens/morse/MorseSend";
import { MorseReceive } from "./screens/morse/MorseReceive";
import { MorseCheckout } from "./screens/morse/MorseCheckout";
import { MorseLearn } from "./screens/morse/MorseLearn";
import { MorseWords } from "./screens/morse/MorseWords";

const INTRO_SESSION_KEY = "cappy-intro-shown";

/**
 * Applies the persisted accessibility settings app-wide: MotionConfig's
 * reducedMotion="always" forces every framer-motion useReducedMotion()
 * call (used throughout the app) to report reduced regardless of the OS
 * media query, and the data-* attributes on <html> drive the CSS in
 * index.css for high contrast / larger text.
 */
function SettingsEffects({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  React.useEffect(() => {
    const root = document.documentElement;
    if (settings?.highContrast) root.setAttribute("data-contrast", "high");
    else root.removeAttribute("data-contrast");

    if (settings?.textSize && settings.textSize !== "medium") {
      root.setAttribute("data-text-size", settings.textSize);
    } else {
      root.removeAttribute("data-text-size");
    }

    if (settings?.reducedMotion) root.setAttribute("data-reduced-motion", "true");
    else root.removeAttribute("data-reduced-motion");
  }, [settings?.highContrast, settings?.textSize, settings?.reducedMotion]);

  return <MotionConfig reducedMotion={settings?.reducedMotion ? "always" : "user"}>{children}</MotionConfig>;
}

function AppRoutes() {
  const [introDone, setIntroDone] = React.useState(
    () => sessionStorage.getItem(INTRO_SESSION_KEY) === "1"
  );

  if (!introDone) {
    return (
      <Loader
        onDone={() => {
          sessionStorage.setItem(INTRO_SESSION_KEY, "1");
          setIntroDone(true);
        }}
      />
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<RequireAuth />}>
          <Route element={<NavLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lessons" element={<LessonList />} />
            <Route path="/lessons/:id/demo" element={<LessonDemo />} />
            <Route path="/lessons/:id/practice" element={<LessonPractice />} />
            <Route path="/lessons/:id/quiz" element={<LessonQuiz />} />
            <Route path="/lessons/:id/review" element={<LessonReview />} />
            <Route path="/morse" element={<MorseDashboard />} />
            <Route path="/morse/levels" element={<MorseLevelList />} />
            <Route path="/morse/levels/:id/learn" element={<MorseLearn />} />
            <Route path="/morse/levels/:id/send" element={<MorseSend />} />
            <Route path="/morse/levels/:id/receive" element={<MorseReceive />} />
            <Route path="/morse/levels/:id/checkout" element={<MorseCheckout />} />
            <Route path="/morse/words/:stageId" element={<MorseWords />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
      <MascotLayer />
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <SettingsEffects>
        <AppRoutes />
      </SettingsEffects>
    </SettingsProvider>
  );
}
