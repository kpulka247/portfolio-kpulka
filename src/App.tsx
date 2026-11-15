import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import MainPage from "./pages/MainPage";

const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

import FullPageLoader from "./components/Loader";

function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </Suspense>
  );
}

export default App;
