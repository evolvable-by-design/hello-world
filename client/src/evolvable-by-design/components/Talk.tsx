import React, { useState, useEffect, useMemo, FunctionComponent } from 'react'
import { Alert, Button, Card, Icon, Pane, Heading, Spinner, Paragraph, majorScale } from 'evergreen-ui'

import { useOperation, WithSemanticData } from '../utils/PivoUtils'
import { usePivo } from '../context/PivoContext'
import ActionDialog from './ActionDialog'
import GenericForm from './GenericForm'
import { ApiOperation, ExpandedOpenAPIV3Semantics, Option, SemanticData } from '@evolvable-by-design/pivo'
import { PivoRelationObject } from '@evolvable-by-design/pivo/build/domain'

function TalkCreator() {
  const pivo = usePivo()

  return pivo.does('https://example.com/api_days_vocab#createTalk')
    .map(operation => <PrivateTalkCreator createTalkOperation={operation} />)
    .getOrElse(<Alert intent="danger" title="The API does not enable to create talks anymore" />)
}

function PrivateTalkCreator({ createTalkOperation }: { createTalkOperation: ApiOperation }) {
  const { parametersDetail, makeCall, isLoading, data, success, error } = useOperation(createTalkOperation)
  const [hasFormErrors, setHasFormErrors] = useState(false)
  const deleteOperation = data?.getRelation('https://example.com/api_days_vocab#DeleteAction')
  const [talk, setTalk] = useState<SemanticData>()

  useEffect(() => {
    if (success) { setTalk(data) }
    else { setTalk(undefined) }
  }, [success, data])

  return !createTalkOperation
    ? <Alert intent="danger" title="The API does not enable to create talks anymore" />
    : <Pane width='80%'>
      <Pane marginBottom="40px">
        <Heading size={700} marginBottom="24px">Create a talk</Heading>
        <GenericForm setHasError={setHasFormErrors}  {...parametersDetail} />
        <Button appearance="primary" onClick={makeCall} disabled={hasFormErrors}>
          {createTalkOperation.operationSchema.schema.summary}
        </Button>
      </Pane>
      <Pane id="resultingTalk" marginBottom="40px">
        <StatelessTalkCreator isLoading={isLoading} error={error} talk={talk} setTalk={setTalk} deleteOperation={deleteOperation} />
      </Pane>
    </Pane>
}

type StatelessTalkCreatorProps = {
  isLoading: boolean
  error?: Error
  talk?: SemanticData
  setTalk: (d: SemanticData | undefined) => void
  deleteOperation?: Option<PivoRelationObject | PivoRelationObject[]>
}

const StatelessTalkCreator: FunctionComponent<StatelessTalkCreatorProps> = ({ isLoading, error, talk, setTalk, deleteOperation }) => {
  if (isLoading) {
    return <Pane width="100%" marginY="30px"><Spinner /></Pane>
  } else if (error) {
    return <Alert intent="danger" title={error.message} />
  } else if (talk) {
    return <WithSemanticData data={talk} mappings={{
      name: 'https://example.com/api_days_vocab#projectName',
      speaker: 'https://example.com/api_days_vocab#speaker',
      startTime: 'https://schema.org/startTime'
    }}>{(data: object) => {
      const { name, speaker, startTime } = data as { name?: string, speaker?: string, startTime?: string }
      return <Talk name={name || 'Loading'} speaker={speaker || ''} startTime={startTime || ''} data={talk} deleteOperation={deleteOperation} onDelete={() => setTalk(undefined)} />
    }
      }
    </WithSemanticData>
  } else {
    return null
  }
}

type TalkProps = { name: string, speaker: string, startTime: string, deleteOperation?: Option<PivoRelationObject | PivoRelationObject[]>, onDelete: () => void, data: SemanticData }

const Talk: FunctionComponent<TalkProps> = ({ name, speaker, startTime, deleteOperation, onDelete, data }) => {
  const otherData = data.getOtherData()
  const otherOperations = data.getOtherRelations()
  const [operationToShow, setOperationToShow] = useState<ExpandedOpenAPIV3Semantics.OperationObject>()

  const deleteOp = deleteOperation?.map(op => op instanceof Array ? op[0] : op).map(op => op.operation).getOrUndefined()
  const operationToShowIsDelete = useMemo(() => deleteOp && deleteOp === operationToShow, [deleteOp, operationToShow])

  return <div>
    <Heading size={700} marginBottom="16px">
      Created talk <Icon icon="tick-circle" color="success" />
    </Heading>
    <Card display="flex" flexDirection="column" elevation={2} width={majorScale(60)} padding={majorScale(2)} minHeight="100px" >
      <Heading size={700}>{name}</Heading>
      <Heading size={400} marginBottom="8px">by {speaker}</Heading>
      <Paragraph marginBottom="8px" size={400}><Icon icon="time" /> {new Date(startTime).toUTCString()}</Paragraph>
      {Object.entries(otherData).map(([key, value]) => <Paragraph key={key} marginBottom="8px" size={400}>{key}: {value}</Paragraph>)}
      <Pane marginBottom="8px">
        {deleteOp && <Button appearance="primary" intent="danger" onClick={() => setOperationToShow(deleteOp)} marginRight="16px">Delete</Button>}
        {otherOperations.map(({ key, operation }) => <Button key={key} onClick={() => setOperationToShow(operation)}>{key}</Button>)}
        {operationToShow && <ActionDialog title={operationToShow.summary || 'Title'} operationSchema={operationToShow} onSuccessCallback={() => { if (operationToShowIsDelete) onDelete() }} onCloseComplete={() => setOperationToShow(undefined)} />}
      </Pane>
    </Card>
  </div>
}

export default TalkCreator
