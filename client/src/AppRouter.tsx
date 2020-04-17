import React from 'react'
import { Route } from 'react-router-dom'

import Talk_v1 from './versioned/Talk_v1'
import Talk_v2 from './versioned/Talk_v2'

const AppRouter = () =>
  <>
    <Route path="/" exact component={Talk_v1} />
    <Route path="/v1" exact component={Talk_v1} />
    <Route path="/v2" exact component={Talk_v2} />
  </>

export default AppRouter