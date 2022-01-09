import {Redirect, Route, Switch} from 'react-router-dom'
import Container from '../App/component/Container'
import routes from './Routes'
import {randomHash} from "../utils";
import axios from "axios";

const isValidToken = async (token) => {
  if (!token) return false
  try {
    const {status} = await axios.post('http://localhost:9100/pvs-api/auth/verifyJwt', null, {
      headers: {Authorization: token}
    })
    return status === 200
  } catch (e) {
    return false
  }
}

function ProtectedRoute({component: Component, ...rest}) {
  const jwtToken = localStorage.getItem("jwtToken")
  if (!jwtToken || !isValidToken(jwtToken)) {
    return <Redirect to="/login"/>
  }
  return (
    <Route {...rest} render={(routeProps) => (
      <Container>
        <Component {...routeProps}/>
      </Container>
    )}/>
  )
}

export default function AllRoutes() {
  const jwt = localStorage.getItem("jwtToken")
  if (jwt) axios.defaults.headers.common['Authorization'] = jwt

  return (
    <Switch>
      {routes.map((prop) =>
        prop.redirect ? <Redirect key={randomHash()} exact from={prop.path} to={prop.to}/> :
          prop.loginRequired ? <ProtectedRoute key={randomHash()} path={prop.path} component={prop.component}/> :
            <Route key={randomHash()} path={prop.path} component={prop.component}/>
      )}
    </Switch>
  )
}
