import { UserState, UserActionTypes, LOGIN, LOGOUT } from '../types/User';

const initialState: UserState = {
    User: null,
};

const userReducer = (state = initialState, action: UserActionTypes): UserState => {
    switch (action.type) {
        case LOGIN: {
            //capitalize first and last name
            const user = action.payload;
            user.firstName = user.firstName.charAt(0).toUpperCase() + user.firstName.substring(1);
            user.lastName = user.lastName.charAt(0).toUpperCase() + user.lastName.substring(1);
            return { ...state, User: user };
        }
        case LOGOUT: {
            return { ...state, User: null };
        }
        default: {
            return state;
        }
    }
};

export { userReducer };
