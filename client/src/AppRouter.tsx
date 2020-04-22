import React, { FunctionComponent } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import Talk_v1 from './versioned/v1/components'
import Talk_v2 from './versioned/v2/components'
import EvolvableByDesignApp from './evolvable-by-design/components/App'

const AppRouter: FunctionComponent = () =>
  <Switch>
    <Route path="/v1" exact component={Talk_v1} />
    <Route path="/v2" exact component={Talk_v2} />
    <Route path="/evolvable-by-design" exact component={EvolvableByDesignApp} />
    <Route path="*"><Redirect to="/v1" /></Route>
  </Switch>

export default AppRouter
