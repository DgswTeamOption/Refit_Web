import React from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Button from './components/Button/Button';

function App() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background, #FAFAFA)' }}>
            <Header />
            <main style={{ flex: 1 }}>
                <Button />
            </main>
            <Footer />
        </div>
    );
}

export default App;
