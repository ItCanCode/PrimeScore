import WelcomePage from "./Pages/WelcomePage"
import HomePage from "./Pages/HomePage";
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from "./Pages/DashBoard";
import UserProfile from "./Pages/UserProfile"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/profile" element={<UserProfile/>} />
      </Routes>

    </>
  )
}

export default App
