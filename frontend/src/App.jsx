import WelcomePage from "./Pages/WelcomePage"
import HomePage from "./Pages/HomePage";
import AdminHome from "./Pages/adminHomepage";
import { Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin" element={<AdminHome/>}></Route>
      </Routes>

    </>
  )
}

export default App
