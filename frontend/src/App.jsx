
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { useState, useEffect } from 'react';

function App() {
  const [count, setCount] = useState(0)
  

  useEffect(() => {
  fetch(`${process.env.REACT_APP_API_URL}/api/hello`)
    .then(res => res.json())
    .then(data => {
      console.log('Data from backend:', data);
    })
    .catch(err => {
      console.error('Error fetching:', err);
    });
}, []);
  return (
    <>
      <div>

      </div>
      <h1>Amigo the scrumaster</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
         <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
  
      </div>
      <p className="read-the-docs">
       Pretty is pretty 
      </p>
    </>
  )
}

export default App
