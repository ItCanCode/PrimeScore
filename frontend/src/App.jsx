import WelcomePage from "./Pages/WelcomePage"
import HomePage from "./Pages/HomePage";
import AdminHome from "./Pages/adminHomepage";
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from "./Pages/DashBoard";
import UserProfile from "./Pages/UserProfile"
import UserHomepage from "./Pages/UserHomepage";
import ManageMatchPage from "./Pages/ManageMatchPage";
import OnGoing from "./Pages/LiveeMatches";
import SportsSelector from "./Pages/SportsSelector";
import TeamManagement from "./Pages/TeamManagement";
import MatchAdminInterface from "./Pages/MatchAdminInterface";
import LiveApiPast7 from "./Pages/PasttMatch";
import Upcoming from "./Pages/UpcomingMatches";
function App() {
  return (
    <>
      <Routes>
        <Route path="/err" element={<Upcoming/>}/>
        <Route path='/hawu' element={<LiveApiPast7/>}/>
        <Route path="/live" element={<OnGoing/>}/>
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
