/* @flow */

// include the LICENSE file
// $FlowIgnore
import 'file-loader?name=LICENSE!../LICENSE';

// load environment listeners
import 'sibling-loader!./environment/foreground/messaging';

import { init, contentStart } from './core/init';

import * as Context from './environment/foreground/context';

init();

Context.establish(contentStart);
