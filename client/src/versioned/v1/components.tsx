import React, { useMemo, useState } from 'react'
import { Alert, Button, Card, Icon, Pane, Heading, TextInputField, Spinner, Paragraph, majorScale } from 'evergreen-ui'
import axios, { AxiosResponse, AxiosError } from 'axios'

import { TalkDetails } from './models'
import { WithHypermedia } from '../../commons/models/hypermedia'

function TalkCreator() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AxiosError>()
  const [name, setName] = useState<string>()
  const isNameValid = useMemo(() => validateName(name), [name])
  const [speaker, setSpeaker] = useState<string>()
  const isSpeakerValid = useMemo(() => validateSpeaker(speaker), [speaker])
  const [startTime, setStartTime] = useState(new Date(Date.now()))
  const [createdTalk, setCreatedTalk] = useState<WithHypermedia<TalkDetails>>()

  return <Pane width='80%'>
    <Heading size={700}>Create a talk</Heading>
    <Pane id="createTalkForm" marginBottom="40px">
      <TextInputField
        required label="Name" value={name || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        validationMessage={isNameValid ? undefined : "Must be 10 to 80 characters long"}
      />
      <TextInputField
        isInvalid={!isSpeakerValid} required label="Speaker" value={speaker || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpeaker(e.target.value)}
      />
      <TextInputField type="datetime-local"
        required label="Start time" value={startTime || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(new Date(e.target.value))}
      />

      <Button appearance="primary"
        disabled={!isNameValid || !isSpeakerValid}
        onClick={() => {
          setIsLoading(true)
          setError(undefined)
          invokeCreateCallApi(name, speaker, startTime)
            .then((response: AxiosResponse<WithHypermedia<TalkDetails>>) => setCreatedTalk(response.data))
            .catch(setError)
            .finally(() => setIsLoading(false))
        }}
      >
        Create talk
      </Button>
    </Pane>
    <Pane id="resultingTalk" marginBottom="40px">
      <StatelessTalkCreator isLoading={isLoading} error={error} createdTalk={createdTalk} setCreatedTalk={setCreatedTalk} />
    </Pane>
  </Pane>
}

type StatelessTalkCreatorProps = { isLoading?: boolean, error?: Error, createdTalk?: WithHypermedia<TalkDetails>, setCreatedTalk: (t: WithHypermedia<TalkDetails> | undefined) => void }

function StatelessTalkCreator({ isLoading, error, createdTalk, setCreatedTalk }: StatelessTalkCreatorProps) {
  if (isLoading) {
    return <Pane width="100%" marginY="30px"><Spinner /></Pane>
  } else if (error) {
    return <Alert intent="danger" title={error.message} />
  } else if (createdTalk) {
    return <Talk
      name={createdTalk.name}
      speaker={createdTalk.speaker}
      startTime={createdTalk.startTime}
      deleteOperation={createdTalk?._links?.find(l => typeof l === "string" ? l === 'delete' : l.relation === 'delete')}
      onDelete={() => setCreatedTalk(undefined)} />
  } else {
    return null
  }
}

interface TalkProps {
  name: string
  speaker: string
  startTime: string
  deleteOperation: any
  onDelete: () => void
}

function Talk({ name, speaker, startTime, deleteOperation, onDelete }: TalkProps) {
  const [error, setError] = useState<AxiosError>()
  return <div>
    <Heading size={700} marginBottom="16px">
      Created talk <Icon icon="tick-circle" color="success" />
    </Heading>
    <Card display="flex" flexDirection="column" elevation={2} width={majorScale(60)} padding={majorScale(2)} minHeight="100px" >
      <Heading size={700}>{name}</Heading>
      <Heading size={400} marginBottom="8px">by {speaker}</Heading>
      <Paragraph marginBottom="8px" size={400}><Icon icon="time" /> {new Date(startTime).toUTCString()}</Paragraph>
      <Pane marginBottom="8px">
        {deleteOperation && <Button appearance="primary" intent="danger" onClick={() => deleteTalk(name).then(onDelete).catch(setError)} marginRight="16px">Delete</Button>}
      </Pane>
      {error && <Alert intent="danger" title={error.message} />}
    </Card>
  </div>
}

const validateName = (value?: string) => value === undefined ? true : value.length >= 10 && value.length <= 80

const validateSpeaker = (value?: string) => value === undefined ? true : value.length > 0

async function invokeCreateCallApi(name?: string, speaker?: string, startTime?: Date): Promise<AxiosResponse<WithHypermedia<TalkDetails>>> {
  return axios.post('http://localhost:8080/talk', { name, speaker, startTime: startTime?.toISOString() })
}

async function deleteTalk(name: string): Promise<AxiosResponse<void>> {
  return axios.delete(`http://localhost:8080/talk/${name}`)
}

export default TalkCreator