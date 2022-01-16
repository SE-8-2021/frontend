import { useEffect, useState } from 'react'
import { Backdrop, CircularProgress } from '@mui/material'
import { makeStyles } from '@mui/styles'
import Axios from 'axios'
import moment from 'moment'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import DrawingBoard from './DrawingBoard'
import ProjectAvatar from './ProjectAvatar'

const useStyles = makeStyles(theme => ({
  root: {
    marginLeft: '10px',
  },
  chartContainer: {
    'display': 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
    'minWidth': '30px',
  },
  chart: {
    width: '67%',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  buttonContainer: {
    'display': 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
    'minWidth': '30px',
    'alignItems': 'center',
    'width': '67%',
    'justifyContent': 'space-between',
  },
  title: {
    display: 'flex',
    marginLeft: '15px',
    marginRight: '15px',
    alignItems: 'center',
  },
  avatar: {
    display: 'inline-block',
  },
  header: {
    display: 'flex',
    width: '95%',
  },
}))

function CodeBasePage(prop) {
  const classes = useStyles()
  const { startMonth, endMonth } = prop
  const [commitListData, setCommitListData] = useState([])
  const [dataForCodeBaseChart, setDataForCodeBaseChart] = useState({ labels: [], data: { additions: [], deletions: [] } })

  const [currentProject, setCurrentProject] = useState({})

  const projectId = localStorage.getItem('projectId')
  const jwtToken = localStorage.getItem('jwtToken')
  const memberId = localStorage.getItem('memberId')

  const [open, setOpen] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const loadingCommitsEnd = () => {
    setOpen(false)
  }
  const loadingCommitsStart = () => {
    setOpen(true)
  }

  const headers = { ...(jwtToken && { Authorization: jwtToken }) }

  const sendPVSBackendRequest = async(method, url) => {
    const baseURL = 'http://localhost:9100/pvs-api'
    const requestConfig = {
      baseURL,
      url,
      method,
      headers,
    }
    return (await Axios.request(requestConfig))?.data
  }

  const loadInitialProjectInfo = async() => {
    try {
      const response = await sendPVSBackendRequest('GET', `/project/${memberId}/${projectId}`)
      setCurrentProject(response)
    }
    catch (e) {
      alert(e.response?.status)
      console.error(e)
    }
  }

  useEffect(() => {
    loadInitialProjectInfo()
  }, [])

  const getCommit = async() => {
    const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
    const gitlabRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'gitlab')

    const repo = githubRepo ?? gitlabRepo
    if (repo !== undefined) {
      const query = repo.url.split(`${repo.type}.com/`)[1]

      try {
        await sendPVSBackendRequest('POST', `http://localhost:9100/pvs-api/${repo.type}/commits/${query}`)
        getCommitFromDB()
        setLoading(false)
      }
      catch (e) {
        alert(e.response?.status)
        console.error(e)
      }
    }
  }

  const getCommitFromDB = async() => {
    const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
    const gitlabRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'gitlab')

    const repo = githubRepo ?? gitlabRepo
    if (repo !== undefined) {
      const query = repo.url.split(`${repo.type}.com/`)[1]
      const repoOwner = query.split('/')[0]
      const repoName = query.split('/')[1]

      try {
        const response = await sendPVSBackendRequest('GET', `/${repo.type}/commits/${repoOwner}/${repoName}`)
        setCommitListData(response)
        loadingCommitsEnd()
      }
      catch (e) {
        alert(e.response?.status)
        console.error(e)
        loadingCommitsEnd()
      }
    }
  }

  const handleClick = () => setLoading(true)

  // Default get commits from database
  useEffect(() => {
    if (Object.keys(currentProject).length !== 0) {
      loadingCommitsStart()
      getCommitFromDB()
    }
  }, [currentProject, prop.startMonth, prop.endMonth])

  // To reduce loading time, it will get/update commits from GitHub/GitLab only if the reload button is clicked.
  useEffect(() => {
    if (isLoading) {
      const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
      const gitlabRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'gitlab')
      const repo = githubRepo ?? gitlabRepo
      if (repo !== undefined)
        getCommit()
    }
  }, [isLoading])

  const pushAdditionsData = (month, dataset) => {
    dataset.data.additions.push(commitListData.filter((commit) => {
      return moment(commit.committedDate).format('YYYY-MM') === month.format('YYYY-MM')
    })
      .reduce((additionSum, currentCommit) => {
        return additionSum + currentCommit.additions
      }, 0))
  }

  const pushDeletionsData = (month, dataset) => {
    dataset.data.deletions.push(commitListData.filter((commit) => {
      return moment(commit.committedDate).format('YYYY-MM') === month.format('YYYY-MM')
    })
      .reduce((deletionSum, currentCommit) => {
        return deletionSum - currentCommit.deletions
      }, 0))
  }

  const setCodeBaseChart = () => {
    const dataset = { labels: [], data: { additions: [], deletions: [] } }
    for (let month = moment(startMonth); month <= moment(endMonth); month = month.add(1, 'months')) {
      dataset.labels.push(month.format('YYYY-MM'))
      pushAdditionsData(month, dataset)
      pushDeletionsData(month, dataset)
    }
    setDataForCodeBaseChart(dataset)
  }

  useEffect(() => {
    setCodeBaseChart()
  }, [commitListData, prop.startMonth, prop.endMonth])

  return (
    <div className={ classes.root }>
      <Backdrop className={ classes.backdrop } open={ open }>
        <CircularProgress color="inherit"/>
      </Backdrop>
      <header className={ classes.header }>
        <div className={ classes.header }>
          <ProjectAvatar
            size="small"
            project={ currentProject }
            className={ classes.avatar }
          />
          <h2 className={ classes.title }>{currentProject ? currentProject.projectName : ''}</h2>
        </div>
        <div className={ classes.buttonContainer }>
          {/* Reload Button */}
          <Button
            disabled={ isLoading }
            onClick={ !isLoading ? handleClick : null }
          >
            {isLoading ? 'Loading…' : 'Reload'}
          </Button>
        </div>
      </header>

      <div className={ classes.chartContainer }>
        <div className={ classes.chart }>
          <h1>Team</h1>
          <div>
            <DrawingBoard data={ dataForCodeBaseChart } isCodeBase={ true } id="team-codebase-chart" />
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    startMonth: state.selectedMonth.startMonth,
    endMonth: state.selectedMonth.endMonth,
  }
}

export default connect(mapStateToProps)(CodeBasePage)
