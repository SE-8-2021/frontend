import '@progress/kendo-theme-material/dist/all.css'
import { TileLayout } from '@progress/kendo-react-layout'
import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { Backdrop, CircularProgress } from '@mui/material'
import { makeStyles } from '@mui/styles'
import Axios from 'axios'
import CommitsViews from './DashBoardComponent/CommitsViews'
import IssueViews from './DashBoardComponent/IssueViews'
import PullRequestsViews from './DashBoardComponent/PullRequestViews'
import CodeBaseViews from './DashBoardComponent/CodeBaseViews'
import ProjectAvatar from './ProjectAvatar'

const SonarMetrics = lazy(() => import('./SonarMetrics'))

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
    'minWidth': '30px',
    'width': 'auto',
  },
  title: {
    display: 'inline-block',
    marginLeft: '15px',
    marginRight: '15px',
  },
  DashBoard: {
    width: 'calc(100vw - 304px)',
    margin: '1rem auto',
  },
  jobViews: {
    fontSize: '3rem',
    fontWeight: 600,
  },
  tileLayout: {
    width: '100%',
  },
  avatar: {
    display: 'inline-block',
  },
  header: {
    display: 'flex',
    width: '100%',
  },
}))

const initialPositions = [
  {
    col: 1,
    row: 1,
    colSpan: 2,
    rowSpan: 1,
  },
  {
    col: 3,
    row: 1,
    colSpan: 2,
    rowSpan: 1,
  },
  {
    col: 1,
    row: 2,
    colSpan: 2,
    rowSpan: 1,
  },
  {
    col: 3,
    row: 2,
    colSpan: 2,
    rowSpan: 1,
  },
]

function DashboardPage() {
  const classes = useStyles()
  const [positions, setPositions] = useState(initialPositions)
  const [currentProject, setCurrentProject] = useState({})
  const [hasGitHubRepo, setHasGitHubRepo] = useState(false)

  const projectId = localStorage.getItem('projectId')
  const jwtToken = localStorage.getItem('jwtToken')
  const memberId = localStorage.getItem('memberId')
  const [isLoading, setLoading] = useState(false)
  const loadingDataEnd = () => {
    setLoading(false)
  }
  const loadingDataStart = () => {
    setLoading(true)
  }

  const fetchCurrentProject = async() => {
    try {
      const response = await Axios.get(`http://localhost:9100/pvs-api/project/${memberId}/${projectId}`,
        { headers: { Authorization: `${jwtToken}` } })
      setCurrentProject(response.data)
    }
    catch (e) {
      alert(e.response?.status)
      console.error(e)
    }
  }

  const sonarId = useMemo(() => {
    const dto = currentProject?.repositoryDTOList?.find(dto => dto.type === 'sonar')
    return dto?.url && (new URL(dto.url)).searchParams.get('id')
  }, [currentProject])

  useEffect(() => {
    fetchCurrentProject()
  }, [])

  useEffect(() => {
    loadingDataStart()
    const githubRepo = currentProject.repositoryDTOList?.find(repo => repo.type === 'github')
    if (githubRepo !== undefined)
      setHasGitHubRepo(true)

    loadingDataEnd()
  }, [currentProject])

  const githubMetrics = [
    {
      header: 'Commits',
      body: <CommitsViews />,
    },
    {
      header: 'Issues',
      body: <IssueViews />,
    },
    {
      header: 'Pull Requests',
      body: <PullRequestsViews />,
    },
    {
      header: 'Code Base',
      body: <CodeBaseViews />,
    },
  ]

  const handleReposition = (e) => {
    setPositions(e.value)
  }

  return (
    <div className={ classes.root }>
      <Backdrop className={ classes.backdrop } open={ isLoading }>
        <CircularProgress color="inherit" />
      </Backdrop>
      <div>
        <header className={ classes.header }>
          <ProjectAvatar
            size="small"
            project={ currentProject }
            className={ classes.avatar }
          />
          <h2 className={ classes.title }>{currentProject ? currentProject.projectName : ''}</h2>
        </header>

        {
          hasGitHubRepo
          && <div className={ classes.DashBoard }>
            <TileLayout
              className={ classes.tileLayout }
              columns={ 4 }
              rowHeight={ 255 }
              gap={ { rows: 10, columns: 10 } }
              positions={ positions }
              items={ githubMetrics }
              onReposition={ handleReposition }
            />
          </div>
        }
        {
          sonarId
          && <Suspense fallback={ <div>Loading Sonar Metrics...</div> }>
            <SonarMetrics sonarComponentName={ sonarId }/>
          </Suspense>
        }
      </div>
    </div>
  )
}

export default DashboardPage
