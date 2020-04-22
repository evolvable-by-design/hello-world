import React, { useEffect, FunctionComponent } from 'react'
import { Alert, Dialog } from 'evergreen-ui'

import GenericForm from './GenericForm'
import { capitalize, spaceCamelCaseWord } from '../../commons/utils/JsUtils'
import { useOperation } from '../utils/PivoUtils'
import { usePivo } from '../context/PivoContext'
import { ExpandedOpenAPIV3Semantics, ApiOperation } from '@evolvable-by-design/pivo'

type ActionDialogProps = {
  isShown?: boolean,
  title: string,
  operationSchema: ExpandedOpenAPIV3Semantics.OperationObject,
  onSuccessCallback: (data: any) => void
  onCloseComplete: () => void
  setHasError?: (hasError: boolean) => void
}

const ActionDialog: FunctionComponent<ActionDialogProps> = ({ isShown = true, title, operationSchema, onSuccessCallback, onCloseComplete, setHasError }) => {
  const pivo = usePivo()
  const operation: ApiOperation = pivo.fromOperation(operationSchema)
  const { parametersDetail, makeCall, isLoading, data, error, success } = useOperation(operation)

  useEffect(() => { if (success) { onSuccessCallback(data) } }, [data, success, onSuccessCallback])

  return <Dialog
    isShown={isShown !== undefined ? isShown : true}
    title={capitalize(spaceCamelCaseWord(title))}
    confirmLabel="Confirm"
    isConfirmLoading={isLoading}
    onConfirm={makeCall}
    onCloseComplete={onCloseComplete}
  >
    <GenericForm {...parametersDetail} setHasError={setHasError} />
    {success && <Alert intent="success" title={'Success'} />}
    {error && <Alert intent="danger" title={error.message || error} />}
  </Dialog>
}

export default ActionDialog