import React from 'react';
import ClassBlock from './components/ClassBlock/ClassBlock.jsx';


function App() {

  return (
      <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center' }}>
        <ClassBlock title="영어1" onLeave={() => {}} />
    </div>
  );
}

export default App;