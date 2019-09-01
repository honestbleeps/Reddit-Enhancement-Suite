/* @flow */

// Import only the functionality of sortablejs which is needed
import Sortable, { AutoScroll } from 'sortablejs/modular/sortable.core.esm';

Sortable.mount(new AutoScroll());
export { Sortable };
