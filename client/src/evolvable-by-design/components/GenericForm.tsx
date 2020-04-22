import React, { useState, useEffect, FunctionComponent } from 'react'
import { Heading, Pane, Select, Switch, TextInput, majorScale } from 'evergreen-ui'

import { DataConstraintsChecker, ExpandedOpenAPIV3Semantics } from '@evolvable-by-design/pivo'

import { capitalize, spaceCamelCaseWord, stateSetter, Map } from '../../commons/utils/JsUtils'

// TODO: display an error message when required as TextInputField does
// TODO: show required fields close to the label

type GenericFormProps = {
  text?: string
  values: Map<any>
  documentation: Array<ExpandedOpenAPIV3Semantics.ParameterObject>
  setter: (f: (previousState: Map<any>) => Map<any>) => void
  setHasError?: (b: boolean) => void
}

const GenericForm: FunctionComponent<GenericFormProps> = ({ text, values, setter, documentation, setHasError }) => {
  const [errors, setErrors] = useState<Map<string>>({})

  useEffect(() => {
    if (setHasError) {
      setHasError(Object.values(errors).find(a => a !== undefined) !== undefined)
    }
  }, [errors, setHasError]
  )

  if (documentation === undefined || documentation === [])
    return null

  return <Pane width="100%">
    {documentation.map(parameter =>
      <WithLabel label={parameter.name} key={parameter.name} required={parameter.required}>
        <SelectInput
          schema={parameter.schema}
          value={values[parameter.name]}
          error={errors[parameter.name]}
          setValue={stateSetter(setter, parameter.name)}
          setError={stateSetter(setErrors, parameter.name)}
        />
      </WithLabel>
    )}
  </Pane>
}

type LabelProps = { label: string, required?: boolean }

const FormLabel: FunctionComponent<LabelProps> = ({ label, required = false }) =>
  <Pane width={majorScale(15)} marginRight={majorScale(3)}>
    <Heading size={400}>{spaceCamelCaseWord(capitalize(label))}{required ? '*' : ''}</Heading>
  </Pane>

const WithLabel: FunctionComponent<LabelProps> = ({ label, required, children }) =>
  <Pane width="100%" display="flex" flexDirection="row" marginBottom={majorScale(3)} alignItems="baseline">
    <FormLabel label={label} required={required} />
    <Pane width="100%" >
      {children}
    </Pane>
  </Pane>


type SelectInputProps = { schema?: ExpandedOpenAPIV3Semantics.SchemaObject, value: any, setValue: (val: any) => void, error: string, setError: (e: Error) => void }
const SelectInput: FunctionComponent<SelectInputProps> = ({ schema, value, setValue, error, setError }) => {
  // TODO: resolve and use type from the semantic description

  const onChange = (val: any) => {
    const [value, error] = schema ? _validateValue(val, schema) : [val];
    setError(error);
    setValue(value);
  };

  if (schema && schema.type === 'boolean') {
    return <Switch checked={value} onChange={(e) => onChange(e.target.checked)} height={majorScale(3)} />
  } else if (schema && schema.type === 'string' && schema.enum !== undefined) {
    let optionsSet = new Set(schema.enum)
    if (schema.default !== undefined && schema.default !== '')
      optionsSet.add(schema.default)

    const options = Array.from(optionsSet)

    return <Select
      isInvalid={error !== undefined}
      value={value || schema.default}
      placeholder={'Please select an option...'}
      width="100%"
      onChange={(e) => onChange(e.target.value)}
    >
      <option>No value</option>
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </Select>
  } else {
    return <TextInput
      isInvalid={error !== undefined}
      value={value || ''}
      type={jsonSchemaToHtmlFormat(schema?.format)}
      width="100%"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    />
  }
}

function _validateValue(value: any, schema: ExpandedOpenAPIV3Semantics.SchemaObject) {
  const val = schema.type === 'number' ? parseFloat(value)
    : schema.type === 'integer' ? parseInt(value, 10)
      : schema.type === 'boolean' ? value === true
        : value;
  const validate = DataConstraintsChecker.compile(schema);
  const valid = validate(val);

  return [val, valid ? undefined : DataConstraintsChecker.errorsText(validate.errors)];
}

function jsonSchemaToHtmlFormat(format?: string) {
  if (format === undefined) {
    return undefined
  } else if (format === 'datetime') {
    return 'datetime-local'
  } else {
    return format
  }
}

export default GenericForm
