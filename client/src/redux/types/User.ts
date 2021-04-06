export type User = {
    firstName: string;
    lastName: string;
    email: string;
    authToken: string;
};

export interface UserState {
    User: User | null;
}

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

export interface Login {
    type: typeof LOGIN;
    payload: User;
}
export interface Logout {
    type: typeof LOGOUT;
    payload: any;
}

export type UserActionTypes = Logout | Login;
