import { useEffect } from 'react';
import { pageMetadata } from './pages.js';

export function usePageMetadata(pathname) {
    useEffect(() => {
        const { title, tags, canonical, schema } = pageMetadata(pathname);
        document.title = title;
        document.head.querySelectorAll('[data-refit-seo]').forEach(node => node.remove());

        function append(tag, attributes, content) {
            const node = document.createElement(tag);
            node.dataset.refitSeo = '';
            for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
            if (content) node.textContent = content;
            document.head.append(node);
        }

        tags.forEach(([key, name, value]) => append('meta', { [key]: name, content: value }));
        if (canonical) append('link', { rel: 'canonical', href: canonical });
        if (schema) append('script', { type: 'application/ld+json' }, JSON.stringify(schema));
    }, [pathname]);
}
