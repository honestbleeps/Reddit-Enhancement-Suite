/* @flow */

// include the LICENSE file
// $FlowIgnore
import 'file-loader?name=LICENSE!../LICENSE';

// load environment listeners
import 'sibling-loader!./environment/foreground/messaging';

import * as Context from './environment/foreground/context';

import { init, bodyReady } from './core/init';

Context.establish(bodyReady);

init();
