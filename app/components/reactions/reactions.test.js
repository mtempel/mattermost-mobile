// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Reactions from './reactions';

import Preferences from 'mattermost-redux/constants/preferences';

describe('Reactions', () => {
    const baseProps = {
        actions: {
            addReaction: jest.fn(),
            getReactionsForPost: jest.fn(),
            removeReaction: jest.fn(),
        },
        canAddReaction: true,
        canAddMoreReactions: true,
        canRemoveReaction: true,
        currentUserId: 'current-user-id',
        position: 'right',
        postId: 'post-id',
        reactions: {
            'current-user-id-frowning_face': {create_at: 1, emoji_name: 'frowning_face', post_id: 'post-id', user_id: 'current-user-id'},
            'current-user-id-grinning': {create_at: 1, emoji_name: 'grinning', post_id: 'post-id', user_id: 'current-user-id'},
            'current-user-id-sweat': {create_at: 1, emoji_name: 'sweat', post_id: 'post-id', user_id: 'current-user-id'},
        },
        theme: Preferences.THEMES.default,

    };

    test('should match snapshot', () => {
        const wrapper = shallow(<Reactions {...baseProps}/>);
        expect(wrapper.getElement()).toMatchSnapshot();
    });

    test('should match snapshot with canAddReaction = false', () => {
        const wrapper = shallow(
            <Reactions
                {...baseProps}
                canAddReaction={false}
            />,
        );
        expect(wrapper.getElement()).toMatchSnapshot();
    });
});
