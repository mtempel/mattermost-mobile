// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Permissions} from 'mattermost-redux/constants';
import * as channelSelectors from 'mattermost-redux/selectors/entities/channels';
import * as userSelectors from 'mattermost-redux/selectors/entities/users';
import * as generalSelectors from 'mattermost-redux/selectors/entities/general';
import * as preferenceSelectors from 'mattermost-redux/selectors/entities/preferences';
import * as roleSelectors from 'mattermost-redux/selectors/entities/roles';
import * as deviceSelectors from 'app/selectors/device';

import {isMinimumServerVersion} from 'mattermost-redux/utils/helpers';

import {mapStateToProps} from './index';

jest.mock('./post_textbox', () => ({
    __esModule: true,
    default: jest.fn(),
}));

channelSelectors.getCurrentChannel = jest.fn().mockReturnValue({});
channelSelectors.isCurrentChannelReadOnly = jest.fn();
channelSelectors.getCurrentChannelStats = jest.fn();
userSelectors.getStatusForUserId = jest.fn();
generalSelectors.canUploadFilesOnMobile = jest.fn();
preferenceSelectors.getTheme = jest.fn();
roleSelectors.haveIChannelPermission = jest.fn();
deviceSelectors.isLandscape = jest.fn();

describe('mapStateToProps', () => {
    const baseState = {
        entities: {
            general: {
                config: {},
                serverVersion: '',
            },
            users: {
                currentUserId: '',
            },
            channels: {
                currentChannelId: '',
            },
            preferences: {
                myPreferences: {},
            },
        },
        views: {
            channel: {
                drafts: {},
            },
        },
        requests: {
            files: {
                uploadFiles: {
                    status: '',
                },
            },
        },
    };

    const baseOwnProps = {};

    test('haveIChannelPermission is not called when isMinimumServerVersion is not 5.22v', () => {
        const state = {...baseState};
        state.entities.general.serverVersion = '5.21';

        mapStateToProps(state, baseOwnProps);
        expect(isMinimumServerVersion(state.entities.general.serverVersion, 5, 22)).toBe(false);

        expect(roleSelectors.haveIChannelPermission).not.toHaveBeenCalledWith(state, {
            channel: undefined,
            team: undefined,
            permission: Permissions.CREATE_POST,
        });

        expect(roleSelectors.haveIChannelPermission).not.toHaveBeenCalledWith(state, {
            channel: undefined,
            permission: Permissions.USE_CHANNEL_MENTIONS,
        });
    });

    test('haveIChannelPermission is called when isMinimumServerVersion is 5.22v', () => {
        const state = {...baseState};
        state.entities.general.serverVersion = '5.22';

        mapStateToProps(state, baseOwnProps);
        expect(isMinimumServerVersion(state.entities.general.serverVersion, 5, 22)).toBe(true);

        expect(roleSelectors.haveIChannelPermission).toHaveBeenCalledWith(state, {
            channel: undefined,
            team: undefined,
            permission: Permissions.CREATE_POST,
        });

        expect(roleSelectors.haveIChannelPermission).toHaveBeenCalledWith(state, {
            channel: undefined,
            permission: Permissions.USE_CHANNEL_MENTIONS,
        });
    });
});