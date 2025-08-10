import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import WaitlistPage from "./WaitlistPage";
import Dashboard from "./Dashboard";

const samplePitches = [
  { id: "1", title: "First pitch", created_at: "2025-08-10" },
  { id: "2", title: "Second pitch", created_at: "2025-08-09" },
];

export default function App() {
  const [userSignedUp, setUserSignedUp] = useState(false);

  const handleSignUp = () => setUserSignedUp(true);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            userSignedUp ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <WaitlistPage onSignUp={handleSignUp} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            userSignedUp ? (
              <Dashboard pitches={samplePitches} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
