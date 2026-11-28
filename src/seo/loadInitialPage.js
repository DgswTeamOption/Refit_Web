export const loadInitialPage = {
    '/': () => import('../pages/global/Introduce/Introduce.jsx'),
    '/login': () => import('../pages/global/Login/Login.jsx'),
    '/signup': () => import('../pages/global/Signup/Signup.jsx'),
    '/faq': () => import('../pages/global/FaQ/FaQ.jsx'),
};

