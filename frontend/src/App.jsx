import WelcomePage from "./Pages/WelcomePage";
import HomePage from "./Pages/HomePage";
import AdminHome from "./Pages/adminHomepage";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/DashBoard";
import UserProfile from "./Pages/UserProfile";
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
import YouTubeShorts from "./Components/YouTubeShorts.jsx";
import MatchOdds from "./Pages/MattchOdds.jsx";
import ProtectedRoute from "./Pages/ProtectedRoute.jsx";
import MainLayout from "./Layout/MainLayout.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 🌐 Public route */}
        <Route path="/" element={<WelcomePage />} />

        {/* ✅ Routes with Navigation */}
        <Route element={<MainLayout />}>
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sports"
            element={
              <ProtectedRoute>
                <SportsSelector />
              </ProtectedRoute>
            }
          />
          <Route
            path="/primeshots"
            element={
              <ProtectedRoute>
                <YouTubeShorts />
              </ProtectedRoute>
            }
          />
          <Route
          path="/matchOdds"
          element={
            <ProtectedRoute>
              <MatchOdds />
            </ProtectedRoute>
          }
        />
        </Route>


        {/*  Routes without Navigation */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/match"
          element={
            <ProtectedRoute>
              <ManageMatchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserHomepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/management"
          element={
            <ProtectedRoute>
              <TeamManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/match-admin"
          element={
            <ProtectedRoute>
              <MatchAdminInterface />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live/upcoming"
          element={
            <ProtectedRoute>
              <Upcoming />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live/past"
          element={
            <ProtectedRoute>
              <LiveApi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live/ongoing"
          element={
            <ProtectedRoute>
              <OnGoing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ongoing"
          element={
            <ProtectedRoute>
              <OngoingMatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upcoming"
          element={
            <ProtectedRoute>
              <UpcomingMatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/past"
          element={
            <ProtectedRoute>
              <PastMatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rugby/super-rugby"
          element={
            <ProtectedRoute>
              <FixRug />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rugby/local-leagues"
          element={
            <ProtectedRoute>
              <RugbyLocal />
            </ProtectedRoute>
          }
        />

      </Routes>
    </AuthProvider>
  );
}

export default App;
