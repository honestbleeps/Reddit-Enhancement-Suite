/* @flow */

import domPurifyFactory from 'dompurify';
import { Pasteurizer } from './HTMLPasteurizer';

const DOMPurify = domPurifyFactory(window);

const config = {
    ALLOWED_TAGS: Pasteurizer.DEFAULT_CONFIG.elemWhitelist,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR:[]
        .concat(Pasteurizer.DEFAULT_CONFIG.attrWhitelist)
        // Pasteurizer handles tagAttrWhitelist per tag
        .concat(Object.values(Pasteurizer.DEFAULT_CONFIG.tagAttrWhitelist))
        .reduce((a, n) => a.concat(n), []),
    // Pasteurizer handles more allowed protocols
    ALLOW_UNKNOWN_PROTOCOLS: true,
    KEEP_CONTENT: Pasteurizer.DEFAULT_CONFIG.hoistOrphanedContents,
    RETURN_DOM: true,
    SAFE_FOR_JQUERY: true,
};

const safeHtml = (dirty: ?string) => {
    if (!dirty) {
        return [];
    }
    const body = DOMPurify.sanitize(dirty, config);
    [].slice.call(body.childNodes).forEach(node =>
        Pasteurizer.scrubNode(node, Pasteurizer.DEFAULT_CONFIG)
    );
    return body.childNodes;
}

export default safeHtml;