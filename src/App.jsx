import React from 'react';
import Footer from './components/Footer/Footer';
import Condition from "./components/Condition/Condition.jsx";
import ClassBlock from './components/ClassBlock/ClassBlock.jsx';
import Button from './components/Button/Button';
import Calendar from './components/Calendar/Calendar'
import SubNav from './components/SubNav/SubNav';
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
  return (
    <div>
        <Overview hidden={isClassPage} classHref={ENGLISH_CLASS_HREF} />
        {isClassPage && <Class />}
    </div>
  );
}


export default App;
