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
import LiveApi from "./Pages/PastMatch";
import Upcoming from "./Pages/UpcomingMatches";
import OngoingMatches from "./Pages/OngoingMatches";
import { AuthProvider } from "./context/authContext.jsx";
import UpcomingMatches from "./Components/upcomingMatches.jsx";
import FixRug from "./Pages/RugbyFixture.jsx";
import PastMatches from "./Pages/PastMatches.jsx";
import { RugbyLocal } from "./Pages/RugbyLocal.jsx";
function App() {
  return (
    <>
      <AuthProvider>
      <Routes>
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
        <Route path="/live/upcoming" element={<Upcoming/>}/>
        <Route path='/live/past' element={<LiveApi/>}/>
        <Route path="/live/ongoing" element={<OnGoing/>}/>
        <Route path="/ongoing" element={<OngoingMatches/>}/>
        <Route path="/upcoming" element={<UpcomingMatches/>}/>
        <Route path="/past" element={<PastMatches/>}/>
        <Route path="/rugby/super-rugby" element={<FixRug/>}/>
        <Route path="/rugby/local-leagues" element={<RugbyLocal/>}/>
      </Routes>
      </AuthProvider>
    </>
  )
}

export default App
