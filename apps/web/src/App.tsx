import * as React from "react";
import { Route, Routes } from "react-router-dom";
import { NavLayout } from "./components/NavLayout";
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
import { MorseLearn } from "./screens/morse/MorseLearn";
import { MorseCalibration } from "./screens/morse/MorseCalibration";
import { MorseSend } from "./screens/morse/MorseSend";
import { MorseReceive } from "./screens/morse/MorseReceive";
import { MorseCheckout } from "./screens/morse/MorseCheckout";
import { MorseReview } from "./screens/morse/MorseReview";

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<NavLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lessons" element={<LessonList />} />
        <Route path="/lessons/:id/demo" element={<LessonDemo />} />
        <Route path="/lessons/:id/practice" element={<LessonPractice />} />
        <Route path="/lessons/:id/quiz" element={<LessonQuiz />} />
        <Route path="/lessons/:id/review" element={<LessonReview />} />
        <Route path="/morse" element={<MorseDashboard />} />
        <Route path="/morse/levels" element={<MorseLevelList />} />
        <Route path="/morse/levels/:id/learn" element={<MorseLearn />} />
        <Route path="/morse/levels/:id/calibrate" element={<MorseCalibration />} />
        <Route path="/morse/levels/:id/send" element={<MorseSend />} />
        <Route path="/morse/levels/:id/receive" element={<MorseReceive />} />
        <Route path="/morse/levels/:id/checkout" element={<MorseCheckout />} />
        <Route path="/morse/levels/:id/review" element={<MorseReview />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
