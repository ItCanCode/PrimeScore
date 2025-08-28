import WelcomePage from "./Pages/WelcomePage"
import HomePage from "./Pages/HomePage";
import AdminHome from "./Pages/adminHomepage";
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from "./Pages/DashBoard";
import UserProfile from "./Pages/UserProfile"
import UserHomepage from "./Pages/UserHomepage";
import ManagerHomepage from "./Pages/managerHomepage";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin" element={<AdminHome/>}></Route>
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/profile" element={<UserProfile/>} />
        <Route path="/user" element={<UserHomepage />} />
        <Route path="/manager" element={<ManagerHomepage />}></Route>
      </Routes>

    </>
  )
}

export default App
