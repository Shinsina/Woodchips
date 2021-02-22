import React from 'react'
import './App.css';
import AuthProvider from './components/AuthContext'
import LogInScreen from './components/LogInScreen'
import {BrowserRouter, Switch,Route} from 'react-router-dom'

function App() {
  return (
  <>
  <BrowserRouter>
  <AuthProvider>
    <Switch>
      <Route exact path="/" component={LogInScreen}/>
    </Switch>
  </AuthProvider>
  </BrowserRouter>
  </>
  );
}

export default App;
