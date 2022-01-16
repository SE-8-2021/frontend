import { useEffect, useState } from 'react'
import { Backdrop, CircularProgress } from '@mui/material'
import { makeStyles } from '@mui/styles'
import Axios from 'axios'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import Chart from 'react-google-charts'
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

function ContributionPage(prop) {
  const classes = useStyles()
  const [commitListData, setCommitListData] = useState([])
  const [dataForMemberCommitPieChart, setDataForMemberCommitPieChart] = useState({ data: [] })
  const [dataForMemberCommitBarChart, setDataForMemberCommitBarChart] = useState({ data: [] })
  const [currentProject, setCurrentProject] = useState({})

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

  // Get current project
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

  // Generate commits pie chart
  const generatePieChart = () => {
    const chartDataset = { labels: [], data: {} }
    new Set(commitListData.map(commit => commit.authorName)).forEach((author) => {
      chartDataset.data[author] = 0
      chartDataset.labels.push(author)
    })

    commitListData.forEach((commitData) => {
      chartDataset.data[commitData.authorName] += 1
    })

    setDataForMemberCommitPieChart([['Member', 'Numbers of commits']])
    chartDataset.labels.forEach((member) => {
      setDataForMemberCommitPieChart(previousArray => [...previousArray, [member.replace('"', '').replace('"', ''), chartDataset.data[member]]])
    })
  }

  useEffect(() => {
    generatePieChart()
  }, [commitListData])

  // Generate code base bar chart
  const generateBarChart = () => {
    const chartDataset_Addition = { labels: [], data: {} }
    const chartDataset_Deletion = { labels: [], data: {} }
    new Set(commitListData.map(commit => commit.authorName)).forEach((author) => {
      chartDataset_Addition.data[author] = 0
      chartDataset_Addition.labels.push(author)
      chartDataset_Deletion.data[author] = 0
      chartDataset_Deletion.labels.push(author)
    })

    commitListData.forEach((commitData) => {
      chartDataset_Addition.data[commitData.authorName] += commitData.additions
      chartDataset_Deletion.data[commitData.authorName] += commitData.deletions
    })

    setDataForMemberCommitBarChart([['Member', 'Additions', 'Deletions']])
    chartDataset_Addition.labels.forEach((member) => {
      setDataForMemberCommitBarChart(previousArray => [...previousArray, [member.replace('"', '').replace('"', ''), chartDataset_Addition.data[member], chartDataset_Deletion.data[member]]])
    })
  }

  useEffect(() => {
    generateBarChart()
  }, [commitListData])

  if (!projectId) {
    return (
      <Redirect to="/select" />
    )
  }

  return (
    <div className={ classes.root }>
      <Backdrop className={ classes.backdrop } open={ open }>
        <CircularProgress color="inherit" />
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
            {isLoading ? 'Loading…' : 'reload commits'}
          </Button>
        </div>
      </header>

      {/* Commit Pie Chart */}
      <div className={ classes.chartContainer }>
        <div className={ classes.chart }>
          <h1>Commit Number of Each Member</h1>
          <Chart
            chartType="PieChart"
            loader={ <div>Loading Chart</div> }
            data={ dataForMemberCommitPieChart }
            options={ {
              is3D: true, // 3D chart style
              backgroundColor: 'transparent',
              height: '300px',
            } }
          />
        </div>
      </div>

      {/* Code Base Bar Chart */}
      <div className={ classes.chartContainer }>
        <div className={ classes.chart }>
          <h1>Code Base of Each Member</h1>
          <Chart
            chartType="Bar"
            loader={ <div>Loading Chart</div> }
            data={ dataForMemberCommitBarChart }
            options={ {
              height: '300px',
            } }
          />
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

export default connect(mapStateToProps)(ContributionPage)
