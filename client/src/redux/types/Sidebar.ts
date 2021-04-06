export type Sidebar = {
    poppedOut?: boolean;
    width?: number;
}

export interface SidebarState {
    Sidebar: Sidebar | null;
}

export const POPOUT_BAR = 'POPOUT_BAR';
export const SET_BAR_WIDTH = 'SET_BAR_WIDTH';

export interface PopOutBar {
    type: typeof POPOUT_BAR;
    payload: boolean;
}


export interface SetBarWidth {
    type: typeof SET_BAR_WIDTH;
    payload: number;
}

export type SidebarActionTypes = PopOutBar | SetBarWidth;
