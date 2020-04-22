import React, { useMemo, useState } from 'react'
import { Alert, Button, Card, Icon, Pane, Heading, Select, FormField, TextInputField, Text, Spinner, Paragraph, majorScale, SelectMenu } from 'evergreen-ui'
import axios, { AxiosResponse, AxiosError } from 'axios'

import { TalkDetails, Role, TalkCategory } from './models'
import { WithHypermedia } from '../../commons/models/hypermedia'

function TalkCreator() {
  const [role, setRole] = useState<Role>('admin')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AxiosError>()
  const [title, setTitle] = useState<string>()
  const isTitleValid = useMemo(() => validateTitle(title), [title])
  const [speaker, setSpeaker] = useState<string>()
  const isSpeakerValid = useMemo(() => nonEmptyString(speaker), [speaker])
  const [startTime, setStartTime] = useState(new Date(Date.now()))
  const [category, setCategory] = useState('')
  const isCategoryValid = useMemo(() => nonEmptyString(category), [category])
  const [createdTalk, setCreatedTalk] = useState<WithHypermedia<TalkDetails>>()

  return <Pane width='80%'>
    <Heading size={700} marginBottom="16px">Create a talk</Heading>
    <RoleSelector role={role} setRole={setRole} />
    <Pane id="createTalkForm" marginBottom="40px">
      <TextInputField
        required label="Title" value={title || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        validationMessage={isTitleValid ? undefined : "Must be 10 to 40 characters long"}
      />
      <TextInputField
        isInvalid={!isSpeakerValid} required label="Speaker" value={speaker || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpeaker(e.target.value)}
      />
      <TextInputField type="datetime-local"
        required label="Start time" value={startTime || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(new Date(e.target.value))}
      />

      <Pane marginBottom="32px">
        <FormField label="Category" />
        <Select value={category} onChange={event => setCategory(event.target.value)}>
          <option value="" disabled>Please select an option</option>
          <option value="API Design">API Design</option>
          <option value="API Maintenance">API Maintenance</option>
          <option value="API Management">API Management</option>
        </Select>
      </Pane>

      <Button appearance="primary"
        disabled={!isTitleValid || !isSpeakerValid || !isCategoryValid}
        onClick={() => {
          setIsLoading(true); setError(undefined); invokeCreateCallApi(title, speaker, startTime, category, role)
            .then(result => setCreatedTalk(result.data))
            .catch(setError)
            .finally(() => setIsLoading(false))
        }}
      >
        Create talk
      </Button>
    </Pane>
    <Pane id="resultingTalk" marginBottom="40px">
      <StatelessTalkCreator isLoading={isLoading} error={error} role={role} createdTalk={createdTalk} setCreatedTalk={setCreatedTalk} />
    </Pane>
  </Pane>
}

type StatelessTalkCreatorProps = { isLoading?: boolean, error?: Error, role: Role, createdTalk?: WithHypermedia<TalkDetails>, setCreatedTalk: (t: WithHypermedia<TalkDetails> | undefined) => void }
function StatelessTalkCreator({ isLoading, error, role, createdTalk, setCreatedTalk }: StatelessTalkCreatorProps) {
  if (isLoading) {
    return <Pane width="100%" marginY="30px"><Spinner /></Pane>
  } else if (error) {
    return <Alert intent="danger" title={error.message} />
  } else if (createdTalk) {
    return <Talk
      name={createdTalk.title}
      speaker={createdTalk.speaker}
      startTime={createdTalk.startTime}
      category={createdTalk.category}
      deletable={createdTalk?._links?.find(l => typeof l === "string" ? l === 'delete' : l.relation === 'delete') !== undefined}
      onDelete={() => setCreatedTalk(undefined)}
      canAttend={createdTalk?._links?.find(l => typeof l === "string" ? l === 'attend' : l.relation === 'attend') !== undefined}
      role={role}
    />
  } else {
    return null
  }
}

type TalkProps = { role: Role, name: string, speaker: string, startTime: string, category: TalkCategory, deletable: boolean, onDelete: () => void, canAttend: boolean }

function Talk({ role, name, speaker, startTime, category, deletable, onDelete, canAttend }: TalkProps) {
  const [error, setError] = useState<AxiosError>()
  return <div>
    <Heading size={700} marginBottom="16px">
      Created talk <Icon icon="tick-circle" color="success" />
    </Heading>
    <Card display="flex" flexDirection="column" elevation={2} width={majorScale(60)} padding={majorScale(2)} minHeight="100px" >
      <Heading size={700}>{name}</Heading>
      <Heading size={400} marginBottom="8px">by {speaker}</Heading>
      <Paragraph marginBottom="8px" size={400}><Icon icon="time" /> {new Date(startTime).toUTCString()}</Paragraph>
      <Paragraph marginBottom="8px" size={400}>Category: {category}</Paragraph>
      <Pane marginBottom="8px">
        {deletable && role === 'admin' && <Button appearance="primary" intent="danger" onClick={() => deleteTalk(name).then(onDelete).catch(setError)} marginRight="16px">Delete</Button>}
        {canAttend && <Button appearance="primary" onClick={() => attendTalk(name)}>Attend to the talk</Button>}
      </Pane>
      {error && <Alert intent="danger" title={error.message} />}
    </Card>
  </div>
}

type RoleSelectorProps = { role: Role, setRole: (r: Role) => void }
function RoleSelector({ role, setRole }: RoleSelectorProps) {
  return <Pane marginBottom={majorScale(2)}>
    <Text marginRight={majorScale(2)}>Role: </Text>
    <SelectMenu
      height={70}
      width={180}
      hasTitle={false}
      hasFilter={false}
      options={[{ label: 'Administrator', value: 'admin' }, { label: 'User', value: 'user' }]}
      selected={role}
      onSelect={el => setRole(el.value as Role)}
    >
      <Button>{role || 'Select role...'}</Button>
    </SelectMenu>
  </Pane>
}

const validateTitle = (value?: string) => value === undefined ? true : value.length >= 10 && value.length <= 40

const nonEmptyString = (value?: string) =>
  typeof value === 'string' && value.length > 0

function invokeCreateCallApi(title?: string, speaker?: string, startTime?: Date, category?: string, role?: 'admin' | 'user'): Promise<AxiosResponse<WithHypermedia<TalkDetails>>> {
  return axios.post(`http://localhost:8080/talks?role=${role}`, { title, speaker, startTime, category })
}

async function deleteTalk(title: string): Promise<AxiosResponse<void>> {
  return axios.delete(`http://localhost:8080/talks/${title}`)
}

async function attendTalk(title: string): Promise<AxiosResponse<void>> {
  const email = prompt('What is your email address?')
  return axios.post(`http://localhost:8080/talks/${title}/attend`, { email })
}

export default TalkCreator