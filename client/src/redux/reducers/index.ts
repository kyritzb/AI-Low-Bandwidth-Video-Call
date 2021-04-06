import { combineReducers } from 'redux';
//reducers
import { userReducer } from './user';
import { roomReducer } from './room';

const reducers = combineReducers({
    user: userReducer,
    room: roomReducer,
});

export default reducers;
