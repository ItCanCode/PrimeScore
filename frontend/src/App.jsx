import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  
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
