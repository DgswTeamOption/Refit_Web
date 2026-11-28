import { loadInitialPage } from './seo/loadInitialPage.js';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';

const root = document.getElementById('root');

function app(publicPage) {
    return <BrowserRouter><App publicPage={publicPage} /></BrowserRouter>;
}

const path = root.dataset.prerendered;
const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
const search = new URLSearchParams(window.location.search);
const legacy = path === '/' && (search.has('page') || window.location.hash === '#class/english1');

if (path === currentPath && Object.hasOwn(loadInitialPage, path) && !legacy) {
    loadInitialPage[path]().then(({ default: Component }) => {
        hydrateRoot(root, app({ path, Component }));
    });
} else {
    createRoot(root).render(app());
}
