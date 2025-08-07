

import './App.css'
import { useState, useEffect, useRef } from 'react';

function App() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')
  const [message, setmsg] = useState('')
  const inputref=useRef(null)

const backendUrl = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
  fetch(`${backendUrl}/api/hello`)
    .then(res => res.json())
    .then(data => {
      console.log('Data from backend:', data);
      setmsg(data.message)
      setCount(0)
    })
    .catch(err => {
      console.error('Error fetching:', err);
    });
}, [backendUrl]);


  const handlechange=()=>{
    setText(inputref.current.value)
  }
  return (
    <>
      <div>

      </div>
      <h1>Amigo the scrumaster {count}</h1>
      <div className="card">
        <input type='text' ref={inputref} onChange={handlechange}></input>
        <p>typing... {text}</p>
      </div>

      <p> the  response from backend is {message} </p>
    </>
  )
}

export default App
