/* @flow */

/**
 * This file re-exports global libraries, which technically could be accessed via the global object,
 * to ease the future pain of migrating them to proper libraries (imported from npm).
 */

export { $ } from './jquery';

export { guiders } from './jqueryPlugins';
