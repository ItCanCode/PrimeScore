import WelcomePage from "./Pages/WelcomePage"
import HomePage from "./Pages/HomePage";
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from "./Pages/DashBoard";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard/>} />
      </Routes>

    </>
  )
}

export default App
