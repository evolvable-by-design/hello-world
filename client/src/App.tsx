import React, { FunctionComponent } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'

import AppRouter from './AppRouter'
import FullscreenCenterContainer from './components/FullscreenCenterContainer'

const App = () => {
  return (
    <div className="App">
      <Router>
        <FullscreenCenterContainer>
          <AppRouter />
        </FullscreenCenterContainer>
      </Router>
    </div>
  )
}

export default App
