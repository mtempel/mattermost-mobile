// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Linking} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {Provider} from 'react-redux';

import EventEmitter from 'mattermost-redux/utils/event_emitter';

import {loadMe, logout} from 'app/actions/views/user';

import {resetToChannel, resetToSelectServer} from 'app/actions/navigation';
import {setDeepLinkURL} from 'app/actions/views/root';
import {NavigationTypes} from 'app/constants';
import {getAppCredentials} from 'app/init/credentials';
import emmProvider from 'app/init/emm_provider';
import 'app/init/device';
import 'app/init/fetch';
import globalEventHandler from 'app/init/global_event_handler';
import {registerScreens} from 'app/screens';
import store from 'app/store';
import {waitForHydration} from 'app/store/utils';
import EphemeralStore from 'app/store/ephemeral_store';
import telemetry from 'app/telemetry';
import {validatePreviousVersion} from 'app/utils/general';
import pushNotificationsUtils from 'app/utils/push_notifications';
import {captureJSException} from 'app/utils/sentry';

const init = async () => {
    const credentials = await getAppCredentials();
    if (EphemeralStore.appStarted) {
        launchApp(credentials);
        return;
    }

    pushNotificationsUtils.configure(store);
    globalEventHandler.configure({
        store,
        launchApp,
    });

    registerScreens(store, Provider);

    if (!EphemeralStore.appStarted) {
        launchAppAndAuthenticateIfNeeded(credentials);
    }
};

const launchApp = (credentials) => {
    telemetry.start([
        'start:select_server_screen',
        'start:channel_screen',
    ]);

    if (credentials) {
        waitForHydration(store, () => {
            const {previousVersion} = store.getState().app;
            const valid = validatePreviousVersion(previousVersion);
            if (valid) {
                store.dispatch(loadMe());
                resetToChannel({skipMetrics: true});
            } else {
                const error = new Error(`Previous app version "${previousVersion}" is invalid.`);
                captureJSException(error, false, store);
                store.dispatch(logout());
            }
        });
    } else {
        resetToSelectServer(emmProvider.allowOtherServers);
    }

    telemetry.startSinceLaunch(['start:splash_screen']);
    EphemeralStore.appStarted = true;

    Linking.getInitialURL().then((url) => {
        store.dispatch(setDeepLinkURL(url));
    });
};

const launchAppAndAuthenticateIfNeeded = async (credentials) => {
    await emmProvider.handleManagedConfig(store);
    await launchApp(credentials);

    if (emmProvider.enabled) {
        if (emmProvider.jailbreakProtection) {
            emmProvider.checkIfDeviceIsTrusted();
        }

        if (emmProvider.inAppPinCode) {
            await emmProvider.handleAuthentication(store);
        }
    }
};

Navigation.events().registerAppLaunchedListener(() => {
    init();

    // Keep track of the latest componentId to appear
    Navigation.events().registerComponentDidAppearListener(({componentId}) => {
        EphemeralStore.addNavigationComponentId(componentId);

        switch (componentId) {
        case 'MainSidebar':
            EventEmitter.emit(NavigationTypes.MAIN_SIDEBAR_DID_OPEN, this.handleSidebarDidOpen);
            EventEmitter.emit(Navigation.BLUR_POST_TEXTBOX);
            break;
        case 'SettingsSidebar':
            EventEmitter.emit(NavigationTypes.BLUR_POST_TEXTBOX);
            break;
        }
    });

    Navigation.events().registerComponentDidDisappearListener(({componentId}) => {
        EphemeralStore.removeNavigationComponentId(componentId);

        if (componentId === 'MainSidebar') {
            EventEmitter.emit(NavigationTypes.MAIN_SIDEBAR_DID_CLOSE);
        }
    });
});
