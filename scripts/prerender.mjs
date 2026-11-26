import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { build } from 'vite';
import { pageMetadata } from '../src/seo/pages.js';

const output = 'dist';
const routes = {
    '/': ['index.html', 'src/pages/global/Introduce/Introduce.jsx'],
    '/faq': ['faq.html', 'src/pages/global/FaQ/FaQ.jsx'],
    '/login': ['login.html', 'src/pages/global/Login/Login.jsx', false],
    '/signup': ['signup.html', 'src/pages/global/Signup/Signup.jsx', false],
    '/introduce': ['introduce.html'],
    '/terms': ['terms.html'],
    '/privacy': ['privacy.html'],
    '/404': ['404.html'],
    '/app': ['app.html'],
};
const scratch = await mkdtemp(join(process.cwd(), '.refit-prerender-'));

function escapeHtml(value) {
    return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

try {
    await build({
        build: {
            ssr: 'src/seo/prerender.jsx', outDir: scratch, emptyOutDir: true,
            copyPublicDir: false, manifest: false, reportCompressedSize: false,
            rollupOptions: { output: { entryFileNames: 'render.mjs', chunkFileNames: '[name]-[hash].mjs' } },
        },
        ssr: { noExternal: ['gsap', 'lenis'] },
    });
    const { render } = await import(pathToFileURL(join(scratch, 'render.mjs')).href);
    const template = await readFile(join(output, 'index.html'), 'utf8');
    const manifestFile = join(output, '.vite/manifest.json');
    const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));

    for (const [path, [file, component, shouldRender = Boolean(component)]] of Object.entries(routes)) {
        const { title, tags, canonical, schema } = pageMetadata(path);
        const head = tags.map(([key, name, value]) =>
            `<meta data-refit-seo ${key}="${name}" content="${escapeHtml(value)}">`);
        if (canonical) head.push(`<link data-refit-seo rel="canonical" href="${canonical}">`);
        if (schema) head.push(`<script data-refit-seo type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`);

        const css = new Set();
        const modules = new Set();
        function collect(key) {
            const chunk = manifest[key];
            if (!chunk || modules.has(chunk.file)) return;
            modules.add(chunk.file);
            chunk.css?.forEach(file => css.add(file));
            chunk.imports?.forEach(collect);
        }
        collect(component);
        css.forEach(file => {
            if (!template.includes(`href="/${file}"`)) head.push(`<link rel="stylesheet" href="/${file}">`);
        });
        modules.forEach(file => {
            if (!template.includes(`href="/${file}"`)) head.push(`<link rel="modulepreload" href="/${file}">`);
        });
        const body = shouldRender
            ? `<div id="root" data-prerendered="${path}">${await render(path)}</div>`
            : '<div id="root"></div>';
        const html = template.replace(/<title[^>]*>.*?<\/title>/, () => `<title>${escapeHtml(title)}</title>\n    ${head.join('\n    ')}`)
            .replace('<div id="root"></div>', () => body);
        await writeFile(join(output, file), html);
    }
    await rm(join(output, '.vite'), { recursive: true, force: true });
} finally {
    await rm(scratch, { recursive: true, force: true });
}
