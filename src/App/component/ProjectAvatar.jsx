import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {makeStyles} from '@material-ui/core/styles'
import {Box, CardActionArea, Avatar, CardActions, IconButton} from '@material-ui/core'
import GitHubIcon from '@material-ui/icons/GitHub';
import GpsFixedIcon from '@material-ui/icons/GpsFixed';
import AddIcon from '@material-ui/icons/Add';
import AddRepositoryDialog from './AddRepositoryDialog';
import {connect} from 'react-redux'
import {setCurrentProjectId} from '../../redux/action'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core'
import Axios from "axios"

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  small: {
    width: theme.spacing(10),
    height: theme.spacing(10),
  },
  large: {
    width: theme.spacing(25),
  },
  icon: {},
  avatar: {
    width: "100%",
    height: "100%"
  }
}))

function ProjectAvatar(props) {
  const classes = useStyles()
  const history = useHistory()


  const [addRepoDialogOpen, setAddRepoDialogOpen] = useState(false)
  const [wantedRepoType, setWantedRepoType] = useState("")
  const [hasGithubRepo, setHasGithubRepo] = useState(false)
  const [hasSonarRepo, setHasSonarRepo] = useState(false)
  const [deletionAlert, setDeletionAlert] = useState(false)
  const jwtToken = localStorage.getItem("jwtToken")

  useEffect(() => {
    if (props.size === 'large') {
      const githubRepo = props.project.repositoryDTOList.find(x => x.type === "github")
      const sonarRepo = props.project.repositoryDTOList.find(x => x.type === "sonar")

      setHasGithubRepo(githubRepo !== undefined)
      setHasSonarRepo(sonarRepo !== undefined)

      if (githubRepo !== undefined) {
        setWantedRepoType("sonar")
      } else if (sonarRepo !== undefined) {
        setWantedRepoType("github")
      }
    }
  }, [props.project])

  const goToCommit = () => {
    localStorage.setItem("projectId", props.project.projectId)
    props.setCurrentProjectId(props.project.projectId)
    history.push("/commits")
  }

  const goToCodeCoverage = () => {
    localStorage.setItem("projectId", props.project.projectId)
    props.setCurrentProjectId(props.project.projectId)
    history.push("/code_coverage")
  }

  const goToDashboard = () => {
    localStorage.setItem("projectId", props.project.projectId)
    props.setCurrentProjectId(props.project.projectId)
    history.push("/dashboard")
  }

  const showAddRepoDialog = () => {

    setAddRepoDialogOpen(true)
  }

  const openDeletionAlert = () => {
    setDeletionAlert(true)
  }

  const closeDeletionAlert = () => {
    setDeletionAlert(false)
  }

  const deleteProject = () => {
    Axios.post(`http://localhost:9100/pvs-api/project/remove/${props.project.projectId}`, "",
      {headers: {"Authorization": `${jwtToken}`}})
      .then(() => {
        closeDeletionAlert()
        props.reloadProjects()
      })
      .catch((e) => {
        alert(e.response.status)
        console.error(e)
      })
  }

  return (
    <div>
      <Box className={props.size === 'large' ? classes.large : classes.small}>
      {props.size === 'large' &&
      <Button onClick={openDeletionAlert}>X</Button>
      }
      <Dialog
      open={deletionAlert}
      onClose={closeDeletionAlert}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">
          {"Are You Sure You Want to Delete This Project?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            If you delete the project, you cannot restore it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeletionAlert}>Back</Button>
          <Button onClick={deleteProject} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
        <CardActionArea onClick={goToDashboard}>
          <Avatar alt="first repository" src={props.project.avatarURL} className={classes.avatar}/>
          {props.size === 'large' &&
          <p style={{"textAlign": "center"}}>{props.project.projectName}</p>
          }
        </CardActionArea>
        {props.size === 'large' &&
        <CardActions disableSpacing>
          {hasGithubRepo &&
          <IconButton aria-label="GitHub" onClick={goToCommit}>
            <GitHubIcon/>
          </IconButton>
          }
          {hasSonarRepo &&
          <IconButton aria-label="SonarQube" onClick={goToCodeCoverage}>
            <GpsFixedIcon/>
          </IconButton>
          }
          {(!hasGithubRepo || !hasSonarRepo) &&
          <IconButton aria-label="Add Repository" onClick={showAddRepoDialog}>
            <AddIcon/>
          </IconButton>
          }
        </CardActions>
        }
      </Box>
      <AddRepositoryDialog
        open={addRepoDialogOpen}
        reloadProjects={props.reloadProjects}
        handleClose={() => setAddRepoDialogOpen(false)}
        projectId={props.project.projectId}
        repoType={wantedRepoType}
      />
    </div>
  )
}

export default connect(null, {setCurrentProjectId})(ProjectAvatar);
