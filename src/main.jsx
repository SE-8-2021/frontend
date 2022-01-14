/* eslint-disable no-unused-vars */
import React from 'react'
import ReactDOM from 'react-dom'
import './assets/style/index.css'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { ThemeProvider, createTheme } from '@mui/material'
import rootReducer from './redux/reducer'
import App from './App'

const store = createStore(rootReducer)

const theme = createTheme({
  palette: {
    primary: {
      light: '#f8e678',
      main: '#f6e04f',
      dark: '#ac9c3c',
      contrastText: '#676767',
    },
    secondary: {
      light: '#b2e3ff',
      main: '#9fddff',
      dark: '#6f9ab2',
      contrastText: '#000',
    },
  },
})

ReactDOM.render(
  <React.StrictMode>
    <Provider store={ store }>
      <ThemeProvider theme={ theme }>
        <App/>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)
