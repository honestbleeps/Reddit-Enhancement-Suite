/* @flow */

// load environment listeners
import 'sibling-loader!./environment/foreground/messaging';

import { init } from './core/init';

init();
