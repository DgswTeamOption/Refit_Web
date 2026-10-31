import React from 'react';
import Condition from "./components/Condition/Condition.jsx";
import Button from './components/Button/Button';
import SubNav from './components/SubNav/SubNav';
function App() {
  return (
    <div style={{
      display: "flex",
      gap:"12px",
      padding:"24px",
      flexFlow:"wrap",
    }}>
      <Condition status="결석" />
      <Condition status="거절됨" />
      <Condition status="출석" />
      <Condition status="수락됨" />
      <Condition status="보강" />
      <Condition status="대기중" />
      <Condition status="필요" />
      <Condition status="불필요" />
    </div>
  );
}

export default App;