import { P2P } from '../../P2P/P2P';
import Peer from '../../P2P/models/Peer';

export interface RoomState {
    P2P: P2P | null;
    me: Peer | null;
    peers: Array<Peer>;
    screensharing: Array<string>;
    isMeScreensharing: boolean;
    isConnected: boolean;
    shareInProgress: boolean;
    components: Array<string>;
}

export const GETPEERSINROOM = 'GET_PEERS_IN_ROOM';
export const SETCONNECTEDTOROOM = 'SET_CONNECTED_TO_ROOM';
export const SETPEERSSCREENSHARING = 'SET_PEERS_SCREENSHARING';
export const SETME = 'SET_ME';
export const SETMESCREENSHARING = 'SET_ME_SCREENSHARING';
export const SHAREINPROGRESS = 'SHARE_IN_PROGRESS';
export const SETTOGGLECOMPONENT = 'SET_TOGGLE_COMPONENT';

export interface GetPeersInRoom {
    type: typeof GETPEERSINROOM;
    payload: Array<Peer>;
}
export interface SetConnectedToRoom {
    type: typeof SETCONNECTEDTOROOM;
    payload: boolean;
}

export interface ToggleComponent {
    type: typeof SETTOGGLECOMPONENT;
    payload: string;
}

export interface SetMeScreensharing {
    type: typeof SETMESCREENSHARING;
    payload: boolean;
}
export interface SetPeersScreensharing {
    type: typeof SETPEERSSCREENSHARING;
    payload: Array<string>;
}
export interface SetMe {
    type: typeof SETME;
    payload: Peer;
}

export interface SetShareInProgress {
    type: typeof SHAREINPROGRESS;
    payload: boolean;
}

export type RoomActionTypes =
    | GetPeersInRoom
    | SetConnectedToRoom
    | SetPeersScreensharing
    | SetMe
    | SetMeScreensharing
    | SetShareInProgress
    | ToggleComponent;
