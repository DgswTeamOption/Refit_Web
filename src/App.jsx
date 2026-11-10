import React from 'react';
import Header from './components/Header/Header.jsx';
import Overview from './pages/teacher/Overview/Overview.jsx';
import Class from './pages/teacher/Class/Class.jsx';

const ENGLISH_CLASS_HREF = '#class/english1';
const CLASS_RELOAD_STATE_KEY = 'refitEnglishClassReload';

function reloadClass(event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    window.history.replaceState({
        ...window.history.state,
        [CLASS_RELOAD_STATE_KEY]: true,
    }, '');
    window.location.reload();
}

function App() {
    const [startsInClass] = React.useState(() => (
        window.location.hash === ENGLISH_CLASS_HREF
        && window.history.state?.[CLASS_RELOAD_STATE_KEY] === true
    ));
    const [isClassPage, setIsClassPage] = React.useState(startsInClass);

    React.useEffect(() => {
        if (startsInClass) {
            const historyState = { ...window.history.state };
            delete historyState[CLASS_RELOAD_STATE_KEY];
            window.history.replaceState(historyState, '');
        } else if (window.location.hash === ENGLISH_CLASS_HREF) {
            const { pathname, search } = window.location;
            window.history.replaceState(window.history.state, '', pathname + search);
        }

        function updatePage() {
            setIsClassPage(window.location.hash === ENGLISH_CLASS_HREF);
        }

        window.addEventListener('hashchange', updatePage);
        return () => window.removeEventListener('hashchange', updatePage);
    }, [startsInClass]);

    const page = isClassPage ? 'class' : 'overview';

    return (
        <div className={`teacher-layout teacher-layout--${page}`}>
            <Header />
            <Overview hidden={isClassPage} classHref={ENGLISH_CLASS_HREF} />
            {isClassPage && <Class classHref={ENGLISH_CLASS_HREF} onReload={reloadClass} />}
        </div>
    );
}

export default App;
