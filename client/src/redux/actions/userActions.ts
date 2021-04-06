import { UserActionTypes, LOGIN, LOGOUT, User } from '../types/User';

export const login = (payload: User): UserActionTypes => {
    return {
        type: LOGIN,
        payload: payload,
    };
};

export const logout = (): UserActionTypes => {
    return {
        type: LOGOUT,
        payload: null,
    };
};
