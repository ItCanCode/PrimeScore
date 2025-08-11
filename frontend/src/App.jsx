import WelcomePage from "./Pages/WelcomePage"
import HomePage from "./Pages/HomePage";

import { Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>

    </>
  )
}

export default App
