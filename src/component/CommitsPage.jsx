import { useEffect, useState } from 'react'
import { Backdrop, CircularProgress, MenuItem, Select } from '@mui/material'
import { makeStyles } from '@mui/styles'
import Axios from 'axios'
import moment from 'moment'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
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

function CommitsPage(prop) {
  const classes = useStyles()
  const { startMonth, endMonth } = prop
  const [commitListData, setCommitListData] = useState([])
  const [dataForTeamCommitChart, setDataForTeamCommitChart] = useState({ labels: [], data: { team: [] } })
  const [dataForMemberCommitChart, setDataForMemberCommitChart] = useState({ labels: [], data: {} })
  const [currentProject, setCurrentProject] = useState({})

  const [numberOfMember, setNumberOfMember] = useState(5)

  const [open, setOpen] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const loadingCommitsEnd = () => {
    setOpen(false)
  }
  const loadingCommitsStart = () => {
    setOpen(true)
  }

  const projectId = localStorage.getItem('projectId')
  const jwtToken = localStorage.getItem('jwtToken')
  const memberId = localStorage.getItem('memberId')

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

  const updateCommit = async() => {
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
      }
      catch (e) {
        alert(e.response?.status)
        console.error(e)
        loadingCommitsEnd()
      }
    }
    loadingCommitsEnd()
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
        updateCommit()
    }
  }, [isLoading])

  const setCommitChart = () => {
    const dataset = { labels: [], data: { team: [] } }
    for (let month = moment(startMonth); month <= moment(endMonth); month = month.add(1, 'months')) {
      dataset.labels.push(month.format('YYYY-MM'))
      dataset.data.team.push(commitListData.filter((commit) => {
        return moment(commit.committedDate).format('YYYY-MM') === month.format('YYYY-MM')
      }).length)
    }
    setDataForTeamCommitChart(dataset)
  }

  useEffect(() => {
    setCommitChart()
  }, [commitListData, prop.startMonth, prop.endMonth])

  const setMemberCommitChart = () => {
    const dataset = { labels: [], data: {} }
    new Set(commitListData.map(commit => commit.authorName)).forEach((author) => {
      dataset.data[author] = []
    })
    for (let month = moment(startMonth); month <= moment(endMonth); month = month.add(1, 'months')) {
      dataset.labels.push(month.format('YYYY-MM'))
      for (const key in dataset.data)
        dataset.data[key].push(0)

      commitListData.forEach((commitData) => {
        if (moment(commitData.committedDate).format('YYYY-MM') === month.format('YYYY-MM'))
          dataset.data[commitData.authorName][dataset.labels.length - 1] += 1
      })
    }
    const temp = Object.keys(dataset.data).map(key => [key, dataset.data[key]])
    temp.sort((first, second) => second[1].reduce((a, b) => a + b) - first[1].reduce((a, b) => a + b))
    const result = {}
    temp.slice(0, numberOfMember).forEach((x) => {
      result[x[0]] = x[1]
    })
    dataset.data = result
    setDataForMemberCommitChart(dataset)
  }

  useEffect(() => {
    setMemberCommitChart()
  }, [commitListData, prop.startMonth, prop.endMonth, numberOfMember])

  if (!projectId) {
    return (
      <Redirect to="/select"/>
    )
  }

  // return commit charts
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
            {isLoading ? 'Loading…' : 'Reload commits'}
          </Button>
        </div>
      </header>

      <div className={ classes.chartContainer }>
        <div className={ classes.chart }>
          <h1>Team</h1>
          <div>
            <DrawingBoard data={ dataForTeamCommitChart } id="team-commit-chart"/>
          </div>
          <div className={ classes.chartContainer }>
            <h1>Member</h1>
            <Select
              labelId="number-of-member-label"
              id="number-of-member"
              value={ numberOfMember }
              onChange={ e => setNumberOfMember(e.target.value) }
            >
              <MenuItem value={ 5 }>5</MenuItem>
              <MenuItem value={ 10 }>10</MenuItem>
              <MenuItem value={ 15 }>15</MenuItem>
            </Select>
          </div>
          <div>
            <DrawingBoard data={ dataForMemberCommitChart } id="member-commit-chart"/>
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

export default connect(mapStateToProps)(CommitsPage)
