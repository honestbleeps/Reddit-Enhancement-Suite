import {Host} from '../../core/host';

export default new Host('imgdjinn', {
    name: 'imgdjinn',
    domains: ['imgdjinn.com'],
    logo: 'https://imgdjinn.com/favicon.ico',
    detect({}) {return true;},
    async handleLink(href) {
        const ab = 'https://imgdjinn.com/api/';
        const ai = 'i/';
        const aa = 'a/i/';
        let acu = null;
        let it = false;

        if (href.indexOf('/i/') > 0) {
            acu = ab + ai + href.match(/[^\/]+$/)[0];
            it = true;
        }

        if (href.indexOf('/a/') > 0) {
            acu = ab + aa + href.match(/[^\/]+$/)[0];
        }

        if(null === acu) return false;

        const call = await fetch(acu);
        const json = call.json();

        if (it) {
            return json.then(r => {
                return {
                    type: 'IMAGE',
                    src: r[0],
                };
            });
        }

        return json.then(r => {
            return {
                type: 'GALLERY',
                src: r.map(i => {
                    return {
                        type: 'IMAGE',
                        src: i,
                    };
                })
            };
        });

    },
});
