import { Routes, Route } from 'react-router-dom';
import Test from './Test';
import LoginForm from './components/LoginForm';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/for" element={<Test />} />
        <Route path='/' element={<LoginForm/>}/>
      </Routes>
    </div>
  );
}

export default App;