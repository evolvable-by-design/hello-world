export type Map<T> = { [key: string]: T }

export function stateSetter (
  setState: (f: (previousState: Map<any>) => Map<any>) => void,
  key: string
): (value: any) => void {
  return (value: any) =>
    setState((previousState: Map<any>) => {
      previousState[key] = value
      return Object.assign({}, previousState)
    })
}

export function capitalize (str: string): string {
  return str
    .split(' ')
    .map(firstLetterUppercase)
    .join(' ')
}

export function firstLetterUppercase (str: string): string {
  return str[0].toUpperCase() + str.substr(1)
}

export function isUpperCase (character: string): boolean {
  return character === character.toUpperCase()
}

export function spaceCamelCaseWord (str: string): string {
  if (str === undefined || str === '') return str

  var result = str[0]
  const s = str.slice(1)

  for (let i = 0; i < s.length; i++) {
    if (isUpperCase(s[i]) && (i <= 0 || !isUpperCase(s[i - 1]))) {
      result += ' '
    }

    result += s[i]
  }

  return result
}
