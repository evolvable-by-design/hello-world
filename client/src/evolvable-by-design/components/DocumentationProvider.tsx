import React, { FunctionComponent, useState, useEffect } from 'react'
import axios from 'axios'
import Pivo from '@evolvable-by-design/pivo'

import Config from '../../config.json'

import ErrorComponent from '../../commons/components/Error'
import FullscreenLoader from '../../commons/components/FullscreenLoader'
import { PivoContextProvider } from '../context/PivoContext'

const DocumentationProvider: FunctionComponent<{}> = ({ children }) => {
  const [isLoading, setLoading] = useState(false)
  const [documentation, setDocumentation] = useState<Pivo>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    setLoading(true)

    axios({ url: Config.serverUrl, method: 'options' })
      .then(response => new Pivo(response.data))
      .then(setDocumentation)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  if (isLoading) {
    return <FullscreenLoader />
  } else if (documentation !== undefined) {
    return <PivoContextProvider state={{ pivo: documentation }}>
      {children}
    </PivoContextProvider>
  } else {
    return <ErrorComponent error={error?.message || 'Something unexpected happened. Please try again later.'} />
  }
}

export default DocumentationProvider