function SportsProfileCard(){
    
    return(
        <section className="favouritePlayer-section">
            <h2>Favourite Players</h2>
            <section>
                favouritePlayer();
            </section>
        </section>
    );
}

function favouritePlayer(name, team, position){
    const [playerName, setPlayerName] = useState("Player");
    const [team, setTeam] = useState("Team");
    const [position, setPositon] = useState("Position");
    const [initials, setInitials] = useState("P");

    return(
        <section className="player-card">
            <h1>Favourite Players</h1>
            <section>
                <section className="icon-section">
                    <p>{initials}</p>
                </section>
                <section className="player-info">
                    <b>{playerName}</b>
                    <p>{team}</p>
                    <p>{position}</p>
                </section>
            </section>
        </section>
    );
}