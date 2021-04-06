import {
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

export const setPeersInRoom = (payload: Array<Peer>): RoomActionTypes => {
    return {
        type: GETPEERSINROOM,
        payload: payload,
    };
};

export const setConnectedToRoom = (payload: boolean): RoomActionTypes => {
    return {
        type: SETCONNECTEDTOROOM,
        payload: payload,
    };
};

export const setMeScreensharing = (payload: boolean): RoomActionTypes => {
    return {
        type: SETMESCREENSHARING,
        payload: payload,
    };
};

export const setScreenSharing = (payload: Array<string>): RoomActionTypes => {
    return {
        type: SETPEERSSCREENSHARING,
        payload: payload,
    };
};

export const setMe = (payload: Peer): RoomActionTypes => {
    return {
        type: SETME,
        payload: payload,
    };
};

export const setShareInProgress = (payload: boolean): RoomActionTypes => {
    return {
        type: SHAREINPROGRESS,
        payload: payload,
    };
};

export const toggleComponent = (payload: string): RoomActionTypes => {
    return {
        type: SETTOGGLECOMPONENT,
        payload: payload,
    };
};
