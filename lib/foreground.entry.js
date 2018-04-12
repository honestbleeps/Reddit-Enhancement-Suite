/* @flow */

// include the LICENSE file
// $FlowIgnore
import 'file-loader?name=LICENSE!../LICENSE';

// load environment listeners
import 'sibling-loader!./environment/foreground/messaging';

import { init } from './core/init';

init();
