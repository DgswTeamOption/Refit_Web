import { Route, Routes } from 'react-router-dom';
import Login from './pages/global/Login/Login.jsx';
function App() {
  return (
    <Routes>
      <Route path = "/" element={<Login/>}/>
    </Routes>
  );
}
export default App;
