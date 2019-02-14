import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import rootReducer from './reducers'
import rootSaga from './sagas'
import { createLogger } from 'redux-logger'
import createSagaMiddleware from 'redux-saga'
import createHistory from 'history/createBrowserHistory'
import { loadingBarMiddleware } from 'react-redux-loading-bar';

// create and export history tracker for router
export const history = createHistory()

const loadingMiddleware = loadingBarMiddleware({
  promiseTypeSuffixes: ['REQUEST', 'SUCCESS', 'FAILURE']
});

// Set initial state
const initialState = {}
const enhancers = []

// setup saga middleware
const sagaMiddleware = createSagaMiddleware()
const middleware = [
  routerMiddleware(history),
  sagaMiddleware,
  loadingMiddleware
]

// If in dev, enable redux devtool extension and logging
if (process.env.NODE_ENV === 'development') {
  // Create logger for debugging
  const logger = createLogger({
    // ...options
  })
  middleware.push(logger)

  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension())
  }
  
}

// combine all the middlewares
const composedEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers
)

// create store with initial state and middleware
const store = createStore(
  rootReducer(history),
  initialState,
  composedEnhancers
)

// run root saga
sagaMiddleware.run(rootSaga)
// export store
export default store

