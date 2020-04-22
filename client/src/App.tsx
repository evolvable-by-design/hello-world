import React, { ErrorInfo } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'

import AppRouter from './AppRouter'
import FullscreenCenterContainer from './commons/components/FullscreenCenterContainer'
import ErrorComponent from './commons/components/Error'

const App = () => {
  return (
    <div className="App">
      <Router>
        <FullscreenCenterContainer>
          <ErrorCatcher>
            <AppRouter />
          </ErrorCatcher>
        </FullscreenCenterContainer>
      </Router>
    </div>
  )
}

type ErrorCatcherState = {
  hasError: boolean
  errorMessage?: string
  errorStack?: string
}

class ErrorCatcher extends React.Component<{}, ErrorCatcherState> {

  state: ErrorCatcherState = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message, errorStack: error.stack }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo)
  }

  setError(error: Error) {
    this.setState(state => { return { ...state, ...ErrorCatcher.getDerivedStateFromError(error) } })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorComponent error={this.state?.errorMessage || 'Unknwon error'} />
    } else {
      return this.props.children
    }
  }

}

export default App
