import { Link } from 'react-router-dom';
import { copy } from '../copy.js';

function ResponsiveLine({ wide, small }) {
    if (wide === small) return wide;
    return (
        <>
            <span className="ri-wide">{wide}</span>
            <span className="ri-small">{small}</span>
        </>
    );
}

export function Heading({ section }) {
    const { wide, small } = copy[section];
    const Title = section === 'hero' ? 'h1' : 'h2';
    return (
        <header className="ri-heading">
            <Title className="ri-title"><ResponsiveLine wide={wide[0]} small={small[0]} /></Title>
            <p className="ri-description"><ResponsiveLine wide={wide[1]} small={small[1]} /></p>
        </header>
    );
}

export function StartLink({ children = '리핏 시작하기', className = '' }) {
    return <Link to="/signup" className={'ri-start-link ' + className}>{children}<span aria-hidden="true">↗</span></Link>;
}
