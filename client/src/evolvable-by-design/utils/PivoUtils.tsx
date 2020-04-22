
import React, { useCallback, useMemo, useState, useEffect, FunctionComponent } from 'react'
import { ApiOperation, ExpandedOpenAPIV3Semantics, SemanticHttpResponse, SemanticData } from '@evolvable-by-design/pivo'
import { AxiosError } from 'axios'

import { Map } from '../../commons/utils/JsUtils'
import { DataSemantics } from '@evolvable-by-design/pivo/build/domain'
import { Spinner } from 'evergreen-ui'

type UseOperationResult = {
  parametersDetail: {
    values: object,
    setter: React.Dispatch<any>,
    documentation: ExpandedOpenAPIV3Semantics.ParameterObject[]
  },
  makeCall: () => void,
  isLoading: boolean,
  success: boolean,
  data?: SemanticData,
  error?: AxiosError,
  userShouldAuthenticate: boolean
}

export function useOperation(operation: ApiOperation, providedValues: object = {}): UseOperationResult {
  const parameters: ExpandedOpenAPIV3Semantics.ParameterObject[] = operation.operationSchema.getParameters()
  const parametersName: [string, string][] = parameters.map((p: ExpandedOpenAPIV3Semantics.ParameterObject) => [p.name, p['@id']])
  const defaultParametersValues = {
    ...operation.operationSchema.getDefaultParametersValue(),
    ...mapProvidedValueToOperationParameter(providedValues, parametersName)
  }
  const [parametersValue, setParametersValue] = useState(
    defaultParametersValues
  )
  const parametersDetail = {
    values: parametersValue,
    setter: setParametersValue,
    documentation: parameters
  }

  const { makeCall, isLoading, success, data, error } = useCaller(
    parametersValue,
    operation.invoke.bind(operation)
  )

  return {
    parametersDetail,
    makeCall,
    isLoading,
    success,
    data,
    error,
    userShouldAuthenticate: operation.userShouldAuthenticate
  }
}

type UseCallerResult = { makeCall: () => void, isLoading: boolean, success: boolean, data?: SemanticData, error?: AxiosError }

export function useCaller(
  parameters: object,
  callFct: (parameters?: object) => Promise<SemanticHttpResponse>
): UseCallerResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AxiosError>()
  const [data, setData] = useState<any>()
  const [callAlreadyTriggered, setCallAlreadyTriggered] = useState(false)
  const success = useMemo(
    () =>
      data !== undefined ||
      (callAlreadyTriggered && !isLoading && error === undefined),
    [callAlreadyTriggered, isLoading, error, data]
  )

  const makeCall = useCallback(() => {
    const call = async () => {
      setIsLoading(true)
      setCallAlreadyTriggered(true)
      setError(undefined)
      try {
        const response = await callFct(parameters)
        setData(response.data)
      } catch (error) {
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }

    call()
  }, [callFct, parameters])

  return { makeCall, isLoading, success, data, error }
}

function mapProvidedValueToOperationParameter(values: Map<any>, keys: [string, string][]): object {
  const valuesK = Object.keys(values || {})
  const res: Map<any> = {}
  keys.forEach(([key, semanticKey]: [string, string]) => {
    if (valuesK.includes(key)) {
      res[key] = values[key]
    } else if (valuesK.includes(semanticKey)) {
      res[key] = values[semanticKey]
    }
  })
  return res
}

export function useAsyncData(data: SemanticData, mappings: { [keyInResult: string]: DataSemantics }): { [key: string]: any } {
  const [resolvedData, setResolvedData] = useState<{ [key: string]: any }>({})

  useEffect(() => {
    const keysInResult = Object.keys(mappings)
    const promises = Object.values(mappings).map(semanticKey => data.getValue(semanticKey))

    Promise.all(promises).then(values =>
      values.reduce((acc, value, index) => {
        acc[keysInResult[index]] = value
        return acc
      }, {} as { [key: string]: any })
    ).then(setResolvedData)
  }, [data, mappings])

  return resolvedData
}

type WithSemanticDataProps = {
  data?: SemanticData,
  mappings: { [keyInResult: string]: DataSemantics },
  children: (data: object) => React.ReactElement,
  fallback?: React.ReactElement
}

export const WithSemanticData: FunctionComponent<WithSemanticDataProps> =
  ({ data, mappings, children, fallback }) => {
    if (data === undefined) {
      return fallback ? fallback : <p>Waiting for data...</p>
    } else {
      return <WithSemanticDataRequired data={data} mappings={mappings} fallback={fallback}>
        {children}
      </WithSemanticDataRequired>
    }
  }

type WithSemanticDataRequiredProps = WithSemanticDataProps & { data: SemanticData }

const WithSemanticDataRequired: FunctionComponent<WithSemanticDataRequiredProps> =
  ({ data, mappings, children }) => {
    const dataToDisplay = useAsyncData(data, mappings)
    if (data === undefined) {
      return <Spinner />
    } else {
      return <>{children(dataToDisplay)}</>
    }
  }
