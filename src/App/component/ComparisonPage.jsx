import { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ProjectAvatar from './ProjectAvatar'
import DrawingBoard from './DrawingBoard'
import Axios from 'axios'
import moment from 'moment'
import { Backdrop, CircularProgress, MenuItem, Select } from '@material-ui/core'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Button } from 'react-bootstrap'

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: '10px',
  },
  chart: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
    minWidth: '30px',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  toLeft: {
    float: 'left',
  },
  toRight: {
    float: 'right',
  },
  selectLeft: {
    width: 300,
    marginRight: 100,
    marginBottom: 20,
  },
  selectRight: {
    width: 300,
    marginLeft: 100,
    marginBottom: 20,
  },
  buttonContainer: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
    minWidth: '30px',
    alignItems: 'center',
    width: "67%",
    justifyContent: "space-between",
  },
  title: {
    display: 'flex',
    marginLeft: '15px',
    marginRight: '15px',
    alignItems: 'center',
  },
  avatar: {
    display: 'inline-block'
  },
  header: {
    display: 'flex',
    width: '100%'
  },
}))

function ComparisonPage(prop) {

  const classes = useStyles()
  const { startMonth, endMonth } = prop

  const [commitListDataLeft, setCommitListDataLeft] = useState([])
  const [commitListDataRight, setCommitListDataRight] = useState([])
  const [dataForComparisonChart, setDataForComparisonChart] = useState({ labels: [], data: {} })
  const [currentProject, setCurrentProject] = useState({})

  const [branchList, setBranchList] = useState([])
  const [selectedBranchList, setSelectedBranchList] = useState([])
  const [leftBranchSelected, setLeftBranchSelected] = useState("")
  const [rightBranchSelected, setRightBranchSelected] = useState("")

  const [open, setOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const loadingCommitsEnd = () => {
    setOpen(false)
  }
  const loadingCommitsStart = () => {
    setOpen(!open)
  }

  const projectId = localStorage.getItem("projectId")
  const memberId = localStorage.getItem("memberId")

  const sendPVSBackendRequest = async (method, url, params) => {
    const baseURL = 'http://localhost:9100/pvs-api'
    const requestConfig = {
      baseURL,
      url,
      method,
      params
    }
    return (await Axios.request(requestConfig))?.data
  }

  const loadInitialProjectInfo = async () => {
    try {
      const response = await sendPVSBackendRequest('GET', `/project/${memberId}/${projectId}`)
      setCurrentProject(response)
    } catch (e) {
      alert(e.response?.status)
      console.error(e)
    }
  }

  useEffect(() => {
    loadInitialProjectInfo()
  }, [])

  const updateCommits = async () => {
    const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
    const gitlabRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'gitlab')

    // Only GitHub & GitLab repo has comparison page, so repo could only be GitHub or GitLab
    const repo = githubRepo !== undefined ? githubRepo : gitlabRepo
    if (repo !== undefined) {
      const query = repo.url.split(repo.type + ".com/")[1]

      try {
        await sendPVSBackendRequest('POST', `http://localhost:9100/pvs-api/${repo.type}/commits/${query}`)
        getCommitFromDBLeft(leftBranchSelected)
        getCommitFromDBRight(rightBranchSelected)
        setLoading(false)
      } catch (e) {
        alert(e.response?.status)
        console.error(e)
      }
    }
  }

  const getCommitFromDBLeft = async (branchName) => {
    const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
    const gitlabRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'gitlab')

    const repo = githubRepo ?? gitlabRepo
    if (repo !== undefined) {
      const query = repo.url.split(repo.type + ".com/")[1]
      const repoOwner = query.split("/")[0]
      const repoName = query.split("/")[1]

      try {
        const response = await sendPVSBackendRequest('GET', `/${repo.type}/commits`, {repoOwner, repoName, branchName})
        setCommitListDataLeft(response)
      } catch (e) {
        alert(e.response?.status)
        console.error(e)
      }
    }
  }

  const getCommitFromDBRight = async (branchName) => {
    const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
    const gitlabRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'gitlab')

    const repo = githubRepo ?? gitlabRepo
    if (repo !== undefined) {
      const query = repo.url.split(repo.type + ".com/")[1]
      const repoOwner = query.split("/")[0]
      const repoName = query.split("/")[1]

      try {
        const response = await sendPVSBackendRequest('GET', `/${repo.type}/commits`, {repoOwner, repoName, branchName})
        setCommitListDataRight(response)
      } catch (e) {
        alert(e.response?.status)
        console.error(e)
      }
    }
  }

  const getBranches = async () => {
    const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
    const gitlabRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'gitlab')

    const repo = githubRepo ?? gitlabRepo
    if (repo !== undefined) {
      const query = repo.url.split(repo.type + ".com/")[1]

      try {
        const response = await sendPVSBackendRequest('GET', `/${repo.type}/branchList/${query}`)
        setBranchList(response)
      } catch (e) {
        alert(e.response?.status)
        console.error(e)
      }
    }
  }

  const leftDiagramUpdate = (e) => {
    setLeftBranchSelected(e)
    getCommitFromDBLeft(e)
    setSelectedBranchList([leftBranchSelected, rightBranchSelected])
  }

  const rightDiagramUpdate = (e) => {
    setRightBranchSelected(e)
    getCommitFromDBRight(e)
    setSelectedBranchList([leftBranchSelected, rightBranchSelected])
  }

  const handleClick = () => setLoading(true);

  const setComparisonChart = () => {
    let dataset = { labels: [], data: {} }
    new Set(selectedBranchList).forEach(branch => {
      dataset.data[branch] = []
    })

    for (let month = moment(startMonth); month <= moment(endMonth); month = month.add(1, 'months')) {
      dataset.labels.push(month.format("YYYY-MM"))
      for (const branch in dataset.data) {
        dataset.data[branch].push(getCommitCountFromSelectedBranch(branch, month))
      }
    }
    setDataForComparisonChart(dataset)
  }

  const getCommitCountFromSelectedBranch = (branch, month) => {
    if (branch !== "" && branch === leftBranchSelected) {
      return commitListDataLeft.filter(commit => {
        return moment(commit.committedDate).format("YYYY-MM") === month.format("YYYY-MM")
      }).length
    }
    if (branch !== "" && branch === rightBranchSelected) {
      return commitListDataRight.filter(commit => {
        return moment(commit.committedDate).format("YYYY-MM") === month.format("YYYY-MM")
      }).length
    }
  }

  useEffect(() => {
    if (Object.keys(currentProject).length !== 0) {
      loadingCommitsStart()
      getBranches()
      getCommitFromDBLeft(leftBranchSelected)
      getCommitFromDBRight(rightBranchSelected)
      setSelectedBranchList([leftBranchSelected, rightBranchSelected])
      loadingCommitsEnd()
    }
  }, [currentProject, prop.startMonth, prop.endMonth, leftBranchSelected, rightBranchSelected])

  useEffect(() => {
    if (isLoading) {
      updateCommits()
    }
  }, [isLoading])

  useEffect(() => {
    setComparisonChart()
  }, [commitListDataLeft, commitListDataRight, prop.startMonth, prop.endMonth, leftBranchSelected, rightBranchSelected])

  // in case there is no projectId
  if (!projectId) {
    return (
      <Redirect to="/select" />
    )
  }

  return (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <header className={classes.header}>
        <div className={classes.header}>
          <ProjectAvatar
            size="small"
            project={currentProject}
            className={classes.avatar}
          />
          <h2 className={classes.title}>{currentProject ? currentProject.projectName : ""}</h2>
        </div>
        <div className={classes.buttonContainer}>
          {/* Reload Button */}
          <Button
            disabled={isLoading}
            onClick={!isLoading ? handleClick : null}
          >
            {isLoading ? 'Loading…' : 'Reload'}
          </Button>
        </div>
      </header>

      <div className={classes.chart}>
        <div>
          <h2>Number of Commits From Two Branches</h2>

          <div className={classes.toLeft}>
            <Select
              className={classes.selectLeft}
              labelId="list-of-branches-label"
              id="list-of-branches"
              value={leftBranchSelected}
              onChange={(e) => leftDiagramUpdate(e.target.value)}
            >
              {branchList.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </div>

          <div className={classes.toRight}>
            <Select
              className={classes.selectRight}
              labelId="list-of-branches-label"
              id="list-of-branches"
              value={rightBranchSelected}
              onChange={(e) => rightDiagramUpdate(e.target.value)}
            >
              {branchList.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </div>

          <div>
            <DrawingBoard data={dataForComparisonChart} id="branches-commit-chart" />
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

export default connect(mapStateToProps)(ComparisonPage);
