// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import initialState from 'app/initial_state';
import configureAppStore from './store';

const store = configureAppStore(initialState);

export default store;
