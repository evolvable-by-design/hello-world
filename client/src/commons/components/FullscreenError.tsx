import React from 'react'

import FullscreenCenterContainer from './FullscreenCenterContainer'
import ErrorComponent from './Error'

const FullscreenError = ({ error }: { error: Error | string }) => {
  return <FullscreenCenterContainer>
    <ErrorComponent error={error instanceof Error ? error.message : error} />
  </FullscreenCenterContainer>
}

export default FullscreenError
