import {useState} from 'react';


function MatchState(){

    const [isStarted, setIsStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [isRunning, setIsRunning] = useState(false);


    async function handleStartMatch(){
        
        setLoading(true);

        const matchId = "9WiywRUkmwXChq4IGEQo";

        const initialDoc = {
        home_score: 0,
        away_score: 0,
        isRunning: true,
        period: 1,
        fouls: [],
        substitutions: [],
        goals: [],
        };

        
        try {
            const res = await fetch(`https://prime-backend.azurewebsites.net/api/feed/${matchId}/start`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                "x-user-role": "admin"
                },
                body: JSON.stringify(initialDoc)
            });

            const data = await res.json();
            console.log("Match started:", data);
        }
        catch (err) {
            console.error("Error starting match:", err);
        } 
        finally {
            setLoading(false);
            setIsStarted(true);
        }
    }

    return(
        <section>

            <header>Manage match</header>
            <button className='start-button'
                onClick={handleStartMatch}
            >{loading ? "Starting..." : (isStarted ? "Pause" : "Start Match") }</button>

        </section>
    )

}

export default MatchState;