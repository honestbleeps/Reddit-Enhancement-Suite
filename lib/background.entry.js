/* @flow */

// load environment listeners
import 'sibling-loader!./environment/background/ajax';

import { migrate } from './core/migrate';

import { addListener } from './environment/background/messaging';

migrate();

// Restoring a backup may require migrations to be run
addListener('runMigrations', migrate);
