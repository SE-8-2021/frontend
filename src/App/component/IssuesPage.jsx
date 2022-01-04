import { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ProjectAvatar from './ProjectAvatar'
import DrawingBoard from './DrawingBoard'
import Axios from 'axios'
import moment from 'moment'
import { Backdrop, CircularProgress } from '@material-ui/core'
import { connect } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: '10px'
  },
  chart: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
    minWidth: '30px',
    alignItems: 'center'
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
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

function IssuesPage(prop) {
  const classes = useStyles()
  const [issueListData, setIssueListData] = useState([])
  const [dataForIssueChart, setDataForIssueChart] = useState({ labels: [], data: { closed: [], created: [] } })

  const [currentProject, setCurrentProject] = useState({})

  const projectId = localStorage.getItem("projectId")
  const jwtToken = localStorage.getItem("jwtToken")

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen(!open);
  };

  useEffect(() => {
    Axios.get(`http://localhost:9100/pvs-api/project/1/${projectId}`,
      { headers: { "Authorization": `${jwtToken}` } })
      .then((response) => {
        setCurrentProject(response.data)
      })
      .catch((e) => {
        alert(e.response?.status)
        console.error(e)
      })
  }, [])

  const getIssueFromGitHub = () => {
    const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
    if (githubRepo !== undefined) {
      const query = githubRepo.url.split("github.com/")[1]

      // todo need reafctor with async
      Axios.get(`http://localhost:9100/pvs-api/github/issues/${query}`,
        { headers: { "Authorization": `${jwtToken}` } })
        .then((response) => {
          setIssueListData(response.data)
        })
        .catch((e) => {
          alert(e);
          console.error(e)
        })
    }
  }

  const getIssueFromGitLab = () => {
    const gitlabRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'gitlab')
    if (gitlabRepo !== undefined) {
      const query = gitlabRepo.url.split("gitlab.com/")[1]

      // todo need refactor with async
      Axios.get(`http://localhost:9100/pvs-api/gitlab/issues/${query}`,
        { headers: { "Authorization": `${jwtToken}` } })
        .then((response) => {
          if (response?.data) {
            setIssueListData(prevArray => ([...prevArray, ...response.data]))
          }
        })
        .catch((e) => {
          alert(e);
          console.error(e)
        })
    }
  }

  useEffect(() => {
    if (Object.keys(currentProject).length !== 0) {
      handleToggle()
      getIssueFromGitHub()
      getIssueFromGitLab()
      handleClose()
    }
  }, [currentProject, prop.startMonth, prop.endMonth])

  useEffect(() => {
    const chartDataset = generateIssueChartDataset()
    setDataForIssueChart(chartDataset)
  }, [issueListData])

  const generateIssueChartDataset = () => {
    const { startMonth, endMonth } = prop
    const chartDataset = { labels: [], data: { closed: [] , created: []} }
    for (let month = moment(startMonth); month <= moment(endMonth); month = month.add(1, 'months')) {
      chartDataset.labels.push(month.format("YYYY-MM"))
    }
    chartDataset.data.created = getIssueCreatedCountArray()
    chartDataset.data.closed = getIssueClosedCountArray()

    return chartDataset
  }

  const getIssueCreatedCountArray = () => {
    const { startMonth, endMonth } = prop
    const created = []
    const issueListDataSortedByCreatedAt = issueListData
    issueListDataSortedByCreatedAt.sort((a, b) => a.createdAt - b.createdAt)
    if (issueListDataSortedByCreatedAt.length > 0) {
      for (let month = moment(startMonth); month <= moment(endMonth); month = month.add(1, 'months')) {
        const issueCountInSelectedRange = issueListDataSortedByCreatedAt.findIndex(issue => {
          return moment(issue.createdAt).year() > month.year() || moment(issue.createdAt).year() === month.year() && moment(issue.createdAt).month() > month.month()
        })
        created.push(issueCountInSelectedRange === -1 ? issueListData.length : issueCountInSelectedRange)
      }
    }
    return created
  }

  const getIssueClosedCountArray = () => {
    const { startMonth, endMonth } = prop
    const closed = []
    const issueListDataSortedByClosedAt = issueListData
    issueListDataSortedByClosedAt.sort((a, b) => a.closedAt - b.closedAt)
    if (issueListDataSortedByClosedAt.length > 0) {
      for (let month = moment(startMonth); month <= moment(endMonth); month = month.add(1, 'months')) {
        let noCloseCount = 0

        const issueCountInSelectedRange = issueListDataSortedByClosedAt.findIndex(issue => {
          if (issue.closedAt == null) noCloseCount += 1
          return moment(issue.closedAt).year() > month.year() || moment(issue.closedAt).year() === month.year() && moment(issue.closedAt).month() > month.month()
        })
        closed.push(issueCountInSelectedRange === -1 ? issueListData.length - noCloseCount : issueCountInSelectedRange - noCloseCount)
      }
    }
    return closed
  }

  return (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <header className={classes.header}>
        <ProjectAvatar
          size="small"
          project={currentProject}
          className={classes.avatar}
        />
        <h2 className={classes.title}>{currentProject ? currentProject.projectName : ""}</h2>
      </header>
      <div className={classes.chart}>
        <div style={{ width: "67%" }}>
          <div>
            <h1>Team</h1>
            <div>
              <DrawingBoard data={dataForIssueChart} color='skyblue' id="team-issue-chart" isIssue={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    startMonth: state.selectedMonth.startMonth,
    endMonth: state.selectedMonth.endMonth
  }
}

export default connect(mapStateToProps)(IssuesPage);
