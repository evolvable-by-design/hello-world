import React, { ErrorInfo } from 'react'

import FullscreenError from './commons/components/FullscreenError'
import FullscreenCenterContainer from './commons/components/FullscreenCenterContainer'
import AppRouter from './AppRouter'

type State = {
  hasError: boolean
  errorMessage?: string
  errorStack?: string
}

export default class AppProxy extends React.Component<{}, State> {

  constructor(props: object) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message, errorStack: error.stack }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo)
  }

  setError(error: Error) {
    this.setState(state => { return { ...state, ...AppProxy.getDerivedStateFromError(error) } })
  }

  render() {
    if (this.state.hasError) {
      return <FullscreenError error={this.state?.errorMessage || 'Unknown error'} />
    } else {
      return <FullscreenCenterContainer>
        <AppRouter>{this.props.children}</AppRouter>
      </FullscreenCenterContainer>
    }
  }

}