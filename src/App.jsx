import React from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

function App() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background, #FAFAFA)' }}>
            <Header />
            <main style={{ flex: 1 }}>
            </main>
            <Footer />
        </div>
    );
}

export default App;
