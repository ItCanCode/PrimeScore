
import "../Styles/UserHomepage.css";
import UpcomingMatches from '../Components/upcomingMatches';

function UserHomepage() {

  return (
    <main className="home-container">
        <UpcomingMatches sportID="Football"/>
    </main>
  );
}

export default UserHomepage;
