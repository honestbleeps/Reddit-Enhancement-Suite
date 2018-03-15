import { Host } from '../../core/host';

export default new Host('imgdjinn', {
    name: 'imgdjinn',
    domains: ['imgdjinn.com'],
    logo: 'https://imgdjinn.com/favicon.ico',
    detect: ({ pathname }) => (/\.imgdjinn.com\/img\/.*(jp?g|gif|png|webm)$/i).exec(pathname),
    handleLink(href) {
        return {
            type: 'IMAGE',
            src: href,
        };
    },
});
