import React from 'react';
import Footer from './components/Footer/Footer';
import Condition from "./components/Condition/Condition.jsx";
import ClassBlock from './components/ClassBlock/ClassBlock.jsx';
import Button from './components/Button/Button';
import Calendar from './components/Calendar/Calendar'
import SubNav from './components/SubNav/SubNav';
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
