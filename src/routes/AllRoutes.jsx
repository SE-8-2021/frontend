import { Navigate, Route, Routes } from 'react-router-dom'
import axios from 'axios'
import Container from '../component/Container'
import { randomHash } from '../utils'
import routes from './Routes'

// eslint-disable-next-line react/prop-types
function ProtectedRoute({ component: Component, ...rest }) {
  const jwtToken = localStorage.getItem('jwtToken')
  if (!jwtToken)
    return <Navigate to="/login"/>

  return (
    <Route { ...rest } render={ routeProps => (
      <Container>
        <Component { ...routeProps }/>
      </Container>
    ) }/>
  )
}

export default function AllRoutes() {
  const jwt = localStorage.getItem('jwtToken')
  if (jwt) axios.defaults.headers.common.Authorization = jwt

  return (
    <Routes>
      {routes.map(prop =>
        prop.redirect
          ? <Navigate key={ randomHash() } exact from={ prop.path } to={ prop.to }/>
          : prop.loginRequired
            ? <ProtectedRoute key={ randomHash() } path={ prop.path } component={ prop.component }/>
            : <Route key={ randomHash() } path={ prop.path } component={ prop.component }/>,
      )}
    </Routes>
  )
}
