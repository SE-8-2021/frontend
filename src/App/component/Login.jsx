import {useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Axios from 'axios'
import logo from '../../assets/welcome.png'
import {useHistory} from 'react-router-dom'
import './Login.css'
import {
  TextField,
  Button
} from '@material-ui/core'

export default function Login() {

  const useStyles = makeStyles((theme) => ({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
      },
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
    accountOperationHint: {
      fontSize: '12px',
      color: '#FF0000',
    },
  }));


  const classes = useStyles()
  const history = useHistory()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [accountOperationHint, setAccountOperationHint] = useState("")

  const login = async () => {
    if (username === "" || password === "") {
      alert("不準啦馬的>///<")
    } else {
      let payload = {
        username: username,
        password: password
      }
      const jwt = await getJWTFrom(payload)
      const memberId = await getMemberId()
      if (jwt !== "" && memberId !== "") {
        localStorage.setItem("jwtToken", jwt)
        localStorage.setItem("memberId", memberId)
        goToSelect()
      } else {
        setAccountOperationHint("InvalidAccount")
      }
    }
  }

  const register = async () => {
    if (username === "" || password === "") {
      alert("不準啦馬的>///<")
    } else {
      let payload = {
        username: username,
        password: password
      }
      try {
        const response = await Axios.post(`http://localhost:9100/pvs-api/auth/register`, payload)
        response.data ? setAccountOperationHint("registerSuccess") : setAccountOperationHint("registerFailed")
      } catch (e) {
        alert(e.response?.status)
        console.error(e)
      }
    }
  }

  const getJWTFrom = async (credential) => {
    try {
      const response = await Axios.post(`http://localhost:9100/pvs-api/auth/login`, credential)
      return response.data
    } catch (e) {
      alert(e.response?.status)
      console.error(e)
    }
  }

  const getMemberId = async () => {
    try {
      const response = await Axios.get(`http://localhost:9100/pvs-api/auth/memberId`, {
        params: {
          username
        }
      })
      return response.data
    } catch (e) {
      alert(e.response?.status)
      console.error(e)
    }
  }

  const goToSelect = () => {
    history.push("/select")
  }

  return (
    <div className={classes.root}>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
        { accountOperationHint === "InvalidAccount" &&
          <p className={classes.accountOperationHint}>Invalid username or password</p>
        }
        { accountOperationHint === "registerSuccess" &&
          <p className={classes.accountOperationHint}>Account register successfully</p>
        }
        { accountOperationHint === "registerFailed" &&
          <p className={classes.accountOperationHint}>Account already exist</p>
        }
        <TextField
          id="username"
          label="Username"
          type="text"
          variant="outlined"
          background="true"
          onChange={(e) => {
            setUsername(e.target.value)
          }}
        />

        <TextField
          id="password"
          label="Password"
          type="password"
          variant="outlined"
          background="true"
          onChange={(e) => {
            setPassword(e.target.value)
          }}
        />
        <br/>
        <span>
          {/* <button onClick={login} >Login</button> */}
          <Button variant="contained" onClick={register} color="primary">
            Register
          </Button>
          {' '}
          <Button variant="contained" onClick={login} color="primary">
            Login
          </Button>
        </span>
      </header>
    </div>
  )
}
