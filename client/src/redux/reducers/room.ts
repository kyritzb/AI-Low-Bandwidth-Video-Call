import {
    RoomState,
    RoomActionTypes,
    GETPEERSINROOM,
    SETCONNECTEDTOROOM,
    SETPEERSSCREENSHARING,
    SETME,
    SETMESCREENSHARING,
    SHAREINPROGRESS,
    SETTOGGLECOMPONENT,
} from '../types/Room';

import Peer from '../../P2P/models/Peer';
import { P2P } from '../../P2P/P2P';
import { serverIO } from '../../api';

const initialState: RoomState = {
    P2P: new P2P(serverIO),
    me: null,
    peers: [],
    screensharing: [],
    isConnected: false,
    isMeScreensharing: false,
    shareInProgress: false,
    components: [],
};

const roomReducer = (state = initialState, action: RoomActionTypes): RoomState => {
    switch (action.type) {
        case GETPEERSINROOM: {
            const newPeerArr: Array<Peer> = [];
            const oldPeerArr = action.payload;
            for (let i = 0; i < oldPeerArr.length; i++) {
                newPeerArr.push(oldPeerArr[i]);
            }
            return { ...state, peers: newPeerArr };
        }
        case SETCONNECTEDTOROOM: {
            const isConnected = action.payload;
            return { ...state, isConnected: isConnected };
        }
        case SETMESCREENSHARING: {
            const isMeScreensharing = action.payload;
            return { ...state, isMeScreensharing: isMeScreensharing };
        }
        case SETPEERSSCREENSHARING: {
            const screensharing = JSON.parse(JSON.stringify(action.payload));
            return { ...state, screensharing: screensharing };
        }
        case SETME: {
            const me = action.payload;
            return { ...state, me: me };
        }
        case SHAREINPROGRESS: {
            const sharing = action.payload;
            return { ...state, shareInProgress: sharing };
        }
        case SETTOGGLECOMPONENT: {
            const component = action.payload;
            const oldState = state.components;

            //add component
            if (oldState.indexOf(component) === -1) {
                oldState.push(component);
            } else {
                //remove component
                oldState.splice(oldState.indexOf(component), 1);
            }
            const newState = JSON.parse(JSON.stringify(oldState));

            return { ...state, components: newState };
        }
        default: {
            return state;
        }
    }
};

export { roomReducer };
