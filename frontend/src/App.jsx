import WelcomePage from "./Pages/WelcomePage"
import HomePage from "./Pages/HomePage";
import AdminHome from "./Pages/adminHomepage";
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from "./Pages/DashBoard";
import UserProfile from "./Pages/UserProfile"
import UserHomepage from "./Pages/UserHomepage";
import ManageMatchPage from "./Pages/ManageMatchPage";
import LiveApi from "./Pages/Liveaapi";
import SportsSelector from "./Pages/SportsSelector";
import TeamManagement from "./Pages/TeamManagement";
import MatchAdminInterface from "./Pages/MatchAdminInterface";

function App() {
  return (
    <>
      <Routes>
        <Route path="/err" element={<LiveApi/>}/>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin" element={<AdminHome/>}></Route>
        <Route path="/admin/match" element={<ManageMatchPage/>}></Route>
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/profile" element={<UserProfile/>} />
        <Route path="/user" element={<UserHomepage />} />
        <Route path="/sports" element={<SportsSelector/>}/>
        <Route path="/management" element={<TeamManagement />}/>
        <Route path="/match-admin" element={<MatchAdminInterface/>}/>
      </Routes>

    </>
  )
}

export default App
