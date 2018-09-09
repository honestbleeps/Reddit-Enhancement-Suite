/* @flow */

import { ALLOWED_MODULES_KEY } from '../constants/sessionStorage';

// load environment listeners
import 'sibling-loader!../environment/foreground/messaging';

import { init, go } from '../core/init';
import { start } from './settingsConsole';

sessionStorage.setItem(ALLOWED_MODULES_KEY, JSON.stringify(['nightMode', 'notifications']));

init();
go.then(start);
