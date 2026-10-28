import React from 'react';
import Condition from "./components/Condition/Condition.jsx";
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
    </div>
  );
}

export default App;