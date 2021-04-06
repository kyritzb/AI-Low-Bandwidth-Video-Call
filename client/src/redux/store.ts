import { createStore, applyMiddleware } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
//types
//reducers
import reducers from './reducers';

export type RootStore = ReturnType<typeof reducers>;

const reduxMiddlewares = [thunk as ThunkMiddleware];

const store = createStore(reducers, composeWithDevTools(applyMiddleware(...reduxMiddlewares)));

export { store };
