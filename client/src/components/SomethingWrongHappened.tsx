import React from 'react';

import { Alert, majorScale } from 'evergreen-ui';

export const SomethingWrongHappened = ({ text }: { text: string }) =>
  <Alert
    intent="warning"
    title={text}
    marginBottom={majorScale(4)}
  />

export const TypeMismatch = ({ actual, target }: { actual: string, target: string }) => <SomethingWrongHappened text={`Something wrong happened 😕. We tried to display ${target} but got ${actual}.`} />

export default SomethingWrongHappened