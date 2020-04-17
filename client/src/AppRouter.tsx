import React from 'react'
import { Route } from 'react-router-dom'

import Talk_v1 from './versioned/v1/components'
import Talk_v2 from './versioned/v2/components'

const AppRouter = () =>
  <>
    <Route path="/" exact component={Talk_v1} />
    <Route path="/v1" exact component={Talk_v1} />
    <Route path="/v2" exact component={Talk_v2} />
  </>

export default AppRouter