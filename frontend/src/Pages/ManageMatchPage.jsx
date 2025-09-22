import MatchState from "../Components/matchState";
import MatchEvents from "../Components/matchEvents";

function ManageMatchPage(){
    return(
      <section>
        <section>
          <MatchState/>
        </section>
        
        <section>
          <MatchEvents/>
        </section>
      </section>
      
    )
}

export default ManageMatchPage;