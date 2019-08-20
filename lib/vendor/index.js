/* @flow */

// Import only the functionality of sortablejs which is needed
import Sortable, { AutoScroll } from 'sortablejs/modular/sortable.core.esm';

Sortable.mount(new AutoScroll());
export { Sortable };

/**
 * Re-export global libraries, which technically could be accessed via the global object,
 * to ease the future pain of migrating them to proper libraries (imported from npm).
 */

export { $ } from './jquery';

export { guiders } from './jqueryPlugins';
