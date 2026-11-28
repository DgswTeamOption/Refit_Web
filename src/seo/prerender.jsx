import { loadInitialPage } from './loadInitialPage.js';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from '../App.jsx';

export async function render(path) {
    const { default: Component } = await loadInitialPage[path]();
    return renderToString(
        <StaticRouter location={path}>
            <App publicPage={{ path, Component }} />
        </StaticRouter>,
    );
}
