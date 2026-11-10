import React from 'react';
import Header from './components/Header/Header.jsx';
import Overview from './pages/teacher/Overview/Overview.jsx';
import Class from './pages/teacher/Class/Class.jsx';

const ENGLISH_CLASS_HREF = '#class/english1';

function App() {
    const [isClassPage, setIsClassPage] = React.useState(
        () => window.location.hash === ENGLISH_CLASS_HREF,
    );

    React.useEffect(() => {
        function updatePage() {
            setIsClassPage(window.location.hash === ENGLISH_CLASS_HREF);
        }

        window.addEventListener('hashchange', updatePage);
        return () => window.removeEventListener('hashchange', updatePage);
    }, []);

    const page = isClassPage ? 'class' : 'overview';

    return (
        <div className={`teacher-layout teacher-layout--${page}`}>
            <Header />
            <Overview hidden={isClassPage} classHref={ENGLISH_CLASS_HREF} />
            {isClassPage && <Class />}
        </div>
    );
}

export default App;
