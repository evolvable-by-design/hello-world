import React, { FunctionComponent } from 'react'

import DocumentationProvider from './DocumentationProvider'
import TalkCreator from './Talk'

const EvolvableByDesignApp: FunctionComponent<{}> = () => {
  return <DocumentationProvider>
    <TalkCreator />
  </DocumentationProvider>
}

export default EvolvableByDesignApp