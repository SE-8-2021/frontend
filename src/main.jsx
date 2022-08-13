import React from 'react'
import ReactDOM from 'react-dom/client'
import './assets/style/index.css'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { ThemeProvider, createTheme } from '@mui/material'
import rootReducer from './redux/reducer'
import App from './App'

const store = configureStore({ reducer: rootReducer })

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={ store }>
      <ThemeProvider theme={ theme }>
        <App/>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
)
