import { useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import Axios from 'axios'
import {
  Card,
  CardActionArea,
  IconButton,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { connect } from 'react-redux'
import { setCurrentProjectId } from '../redux/action'
import { randomHash } from '../utils'
import AddProjectDialog from './AddProjectDialog'
import ProjectAvatar from './ProjectAvatar'

const useStyles = makeStyles(theme => ({
  root: {
    'display': 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
    'flexWrap': 'wrap',
  },
  small: {
    width: theme.spacing(10),
    height: theme.spacing(10),
  },
  large: {
    width: theme.spacing(20),
    height: theme.spacing(30),
  },
  createProjectCard: {
    marginTop: '3.4rem',
    marginLeft: '1rem',
    height: theme.spacing(30),
  },
}))

function SelectProject({ setCurrentProjectId }) {
  const classes = useStyles()
  const [addRepoDialogOpen, setAddRepoDialogOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const jwtToken = localStorage.getItem('jwtToken')
  const memberId = localStorage.getItem('memberId')

  const headers = { ...(jwtToken && { Authorization: jwtToken }) }

  const loadProjects = async() => {
    try {
      const response = await Axios.get(`http://localhost:9100/pvs-api/project/${memberId}/active`, headers)
      setProjects(response.data)
    }
    catch (e) {
      alert(e.response?.status)
      console.error(e)
    }
  }

  useEffect(() => {
    setCurrentProjectId(0)
    loadProjects()
  }, [])

  return (
    <div>
      <h1>Projects</h1>

      <div className={classes.root}>
        {projects.map(project =>
          <ProjectAvatar key={randomHash()} size="large" project={project} reloadProjects={loadProjects}/>,
        )}
        <Card id="create-project-card" className={classes.createProjectCard}>
          <CardActionArea onClick={() => setAddRepoDialogOpen(true)}>
            <IconButton color="primary" className={classes.large} disabled>
              <Add className={classes.small}/>
            </IconButton>
          </CardActionArea>

        </Card>
        <AddProjectDialog
          open={addRepoDialogOpen}
          reloadProjects={loadProjects}
          handleClose={() => setAddRepoDialogOpen(false)}
        />
      </div>
    </div>
  )
}

export default connect(null, { setCurrentProjectId })(SelectProject)
