import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@mui/styles'
import GitHubIcon from '@mui/icons-material/GitHub'
import { SiGitlab, SiSonarcloud, SiTrello } from 'react-icons/si'
import AddIcon from '@mui/icons-material/Add'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { BiEditAlt } from 'react-icons/bi'
import { connect } from 'react-redux'
import {
  Avatar,
  Box,
  Button,
  CardActionArea,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material'
import Axios from 'axios'
import { setCurrentProjectId } from '../redux/action'
import defaultAvatarUrl from '../assets/images/defaultAvatar.png'
import AddRepositoryDialog from './AddRepositoryDialog'

const useStyles = makeStyles(theme => ({
  root: {
    'display': 'flex',
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
  span: {
    marginLeft: '1rem',
    marginRight: '1rem',
  },
  avatar: {
    width: '100% !important',
    height: '100% !important',
  },
  cancelButton: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
    color: '#9fddff',
  },
  deleteButton: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
    color: '#ff4444',
  },
  projectNameContainer: {
    marginTop: '10px',
  },
}))

function ProjectAvatar(props) {
  const classes = useStyles()
  const history = useHistory()

  const [addRepoDialogOpen, setAddRepoDialogOpen] = useState(false)
  const [hasGithubRepo, setHasGithubRepo] = useState(false)
  const [hasGitlabRepo, setHasGitlabRepo] = useState(false)
  const [hasSonarRepo, setHasSonarRepo] = useState(false)
  const [hasTrelloBoard, setHasTrelloBoard] = useState(false)
  const [deletionAlertDialog, setDeletionAlertDialog] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectNameChangeStatus, setProjectNameChangeStatus] = useState(true)
  const [editButtonShow, setEditButtonShow] = useState(true)

  const checkExistedRepo = () => {
    if (props.size === 'large') {
      const getGithubRepo = props.project.repositoryDTOList.find(x => x.type === 'github')
      const getGitlabRepo = props.project.repositoryDTOList.find(x => x.type === 'gitlab')
      const getSonarRepo = props.project.repositoryDTOList.find(x => x.type === 'sonar')
      const getTrelloBoard = props.project.repositoryDTOList.find(x => x.type === 'trello')

      setHasGithubRepo(getGithubRepo !== undefined)
      setHasGitlabRepo(getGitlabRepo !== undefined)
      setHasSonarRepo(getSonarRepo !== undefined)
      setHasTrelloBoard(getTrelloBoard !== undefined)
    }
  }

  useEffect(() => {
    checkExistedRepo()
  }, [props.project])

  const goToCommit = () => {
    localStorage.setItem('projectId', props.project.projectId)
    props.setCurrentProjectId(props.project.projectId)
    history.push('/commits')
  }

  const goToCodeCoverage = () => {
    localStorage.setItem('projectId', props.project.projectId)
    props.setCurrentProjectId(props.project.projectId)
    history.push('/code_coverage')
  }

  const goToDashboard = () => {
    localStorage.setItem('projectId', props.project.projectId)
    props.setCurrentProjectId(props.project.projectId)
    history.push('/dashboard')
  }

  const goToTrelloBoard = () => {
    localStorage.setItem('projectId', props.project.projectId)
    props.setCurrentProjectId(props.project.projectId)
    history.push('/trello_board')
  }

  const showAddRepoDialog = () => {
    setAddRepoDialogOpen(true)
  }

  const toggleDeletionAlertDialog = () => {
    setDeletionAlertDialog(!deletionAlertDialog)
  }

  const deleteProject = async() => {
    try {
      await Axios.delete(`http://localhost:9100/pvs-api/project/remove/${props.project.projectId}`)
      toggleDeletionAlertDialog()
      props.reloadProjects()
    }
    catch (e) {
      alert(e.response?.status)
      console.error(e)
    }
  }

  const renameProject = async() => {
    const projectId = props.project.projectId
    try {
      await Axios.patch(`http://localhost:9100/pvs-api/project/name?name=${projectName}&projectId=${projectId}`)
    }
    catch (e) {
      alert(e.response?.status)
      console.error(e)
    }
  }

  return (
    <span className={classes.span}>
      <Box className={props.size === 'large' ? classes.large : classes.small}>
        {props.size === 'large'
          && <IconButton onClick={toggleDeletionAlertDialog}>
            <AiOutlineCloseCircle />
          </IconButton>
        }
        <Dialog
          open={deletionAlertDialog}
          onClose={toggleDeletionAlertDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description">
          <DialogTitle id="alert-dialog-title">
            {'Are You Sure You Want to Delete This Project?'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              You cannot restore it after deleting.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleDeletionAlertDialog}>
              <p className={classes.cancelButton}>
                Cancel
              </p>
            </Button>
            <Button onClick={deleteProject} autoFocus>
              <p className={classes.deleteButton}>
                Delete
              </p>
            </Button>
          </DialogActions>
        </Dialog>
        <CardActionArea onClick={goToDashboard}>
          {props.project.avatarURL !== ''
            && <Avatar alt="first repository" src={props.project.avatarURL} className={classes.avatar} />
          }
          {props.project.avatarURL === ''
            && <Avatar alt="first repository" src={defaultAvatarUrl} className={classes.avatar} />
          }
        </CardActionArea>

        {/* Project Name TextField */}
        {props.size === 'large'
          && <div className={classes.projectNameContainer}>
            <TextField
              variant="standard"
              id="projectName"
              type="text"
              inputProps={{ style: { marginLeft: '11px', textAlign: 'center' } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onMouseEnter={() => setEditButtonShow(false)}
                      onMouseLeave={() => setEditButtonShow(true)}
                      color="secondary"
                      edge="end"
                      onClick={() => setProjectNameChangeStatus(false)}>
                      {editButtonShow ? '' : <BiEditAlt />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              defaultValue={props.project.projectName}
              disabled={projectNameChangeStatus}
              onChange={(e) => {
                setProjectName(e.target.value)
              }}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter') {
                  renameProject()
                  setProjectNameChangeStatus(true)
                }
                if (ev.key === 'Escape')
                  setProjectNameChangeStatus(true)
              }}
            />
          </div>
        }

        {props.size === 'large'
          && <CardActions disableSpacing>

            {hasGithubRepo
              && <IconButton aria-label="GitHub" onClick={goToCommit}>
                <GitHubIcon />
              </IconButton>
            }

            {hasGitlabRepo
              && <IconButton aria-label="GitLab" onClick={goToCommit}>
                <SiGitlab />
              </IconButton>
            }

            {hasSonarRepo
              && <IconButton aria-label="SonarQube" onClick={goToCodeCoverage}>
                <SiSonarcloud />
              </IconButton>
            }

            {hasTrelloBoard
              && <IconButton aria-label="Trello" onClick={goToTrelloBoard}>
                <SiTrello />
              </IconButton>
            }

            {!((hasGithubRepo || hasTrelloBoard) && hasSonarRepo && hasTrelloBoard)
              && <IconButton aria-label="Add Repository" onClick={showAddRepoDialog}>
                <AddIcon />
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
        hasGitRepo={hasGithubRepo || hasGitlabRepo}
        hasSonar={hasSonarRepo}
        hasTrello={hasTrelloBoard}
      />
    </span>
  )
}

export default connect(null, { setCurrentProjectId })(ProjectAvatar)
