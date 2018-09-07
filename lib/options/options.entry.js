/* @flow */

// load environment listeners
import 'sibling-loader!../environment/foreground/messaging';

import { init, loadOptions } from '../core/init2';

import { start } from './settingsConsole';

init();

loadOptions.then(start);

