import React from 'react';
import ClassBlock from './components/ClassBlock/ClassBlock.jsx';
import Button from './components/Button/Button';
import SubNav from './components/SubNav/SubNav';

function App() {
  return (
      <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center' }}>
        <ClassBlock title="영어1" color='peach' />
    </div>
  );
}

export default App;