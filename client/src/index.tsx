import React from 'react';
import ReactDOM from 'react-dom';
//pages
import Home from './views/Home/Home';
//react router
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
//redux
import { store } from './redux/store';
import { Provider } from 'react-redux';
import GlobalStyle from './global.css';
import { P2P } from './P2P/P2P';
//styles
declare global {
    interface Window {
        STORE: any;
    }
}

//redux store
window.STORE = store;

P2P.initialize({ store });

ReactDOM.render(
    <Provider store={store}>
        <GlobalStyle />
        <Router>
            <Switch>
                <Route exact path="/" component={Home} />
            </Switch>
        </Router>
    </Provider>,
    document.getElementById('root'),
);
