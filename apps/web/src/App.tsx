import * as React from "react";
import { Route, Routes } from "react-router-dom";
import { NavLayout } from "./components/NavLayout";
import { Loader } from "./components/Loader";
import { Landing } from "./screens/Landing";
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

const INTRO_SESSION_KEY = "cappy-intro-shown";

export default function App() {
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
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<NavLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lessons" element={<LessonList />} />
        <Route path="/lessons/:id/demo" element={<LessonDemo />} />
        <Route path="/lessons/:id/practice" element={<LessonPractice />} />
        <Route path="/lessons/:id/quiz" element={<LessonQuiz />} />
        <Route path="/lessons/:id/review" element={<LessonReview />} />
        <Route path="/morse" element={<MorseDashboard />} />
        <Route path="/morse/levels" element={<MorseLevelList />} />
        <Route path="/morse/levels/:id/send" element={<MorseSend />} />
        <Route path="/morse/levels/:id/receive" element={<MorseReceive />} />
        <Route path="/morse/levels/:id/checkout" element={<MorseCheckout />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
