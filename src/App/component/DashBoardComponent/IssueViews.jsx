import { makeStyles } from '@material-ui/core/styles';
import { useEffect, useState } from 'react'
import Axios from 'axios'
import moment from 'moment'
import { connect } from 'react-redux'

const useStyles = makeStyles(() => ({
  totalJobViewsGrid: {
    listStyle: 'none',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '2rem',
    padding: 0,
  },
  jobViewsBlock: {
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobTitle: {
    marginBottom: '1rem',
    fontWeight: 500,
    display: 'block',
  },
  jobViewsContainer: {
    border: '1px solid #7c3aed',
    backgroundColor: '#ede9fe',
    color: '#7c3aed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: '50%',
    width: '6rem',
    height: '6rem',
  },
  jobViews: {
    fontSize: '3rem',
    fontWeight: 600,
  },
}))

function IssueViews(prop) {
  const classes = useStyles()
  const [jobs, setJobs] = useState([])
  const [currentProject, setCurrentProject] = useState({})
  const [issueListData, setIssueListData] = useState([])
  const projectId = localStorage.getItem("projectId")
  const jwtToken = localStorage.getItem("jwtToken")

  useEffect(() => {
    const fetchCurrentProject = async () => {
      try {
        const response = await Axios.get(`http://localhost:9100/pvs-api/project/1/${projectId}`,
          { headers: { "Authorization": `${jwtToken}` } })
        setCurrentProject(response.data)
      } catch (e) {
        alert(e.response?.status)
        console.error(e)
      }
    }
    fetchCurrentProject()
  }, [])

  const getIssueFromGitHub = async () => {
    const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
    if (githubRepo !== undefined) {
      const query = githubRepo.url.split("github.com/")[1]
      try {
        const response = await Axios.get(`http://localhost:9100/pvs-api/github/issues/${query}`,
          { headers: { "Authorization": `${jwtToken}` } })
        setIssueListData(response.data)
      } catch (e) {
        alert(e.response?.status)
        console.error(e)
      }
    }
  }

  useEffect(() => {
    if (Object.keys(currentProject).length !== 0) {
      getIssueFromGitHub()
    }
  }, [currentProject, prop.startMonth, prop.endMonth])

  // Get issue created count and closed count
  useEffect(() => {
    // Only triger the page rendering once
    const calculateData = async () => {
      await Promise.all([
        getIssueCreatedCount(),
        getIssueClosedCount()
      ])
    }
    calculateData()
  }, [issueListData, prop.startMonth, prop.endMonth])

  const getIssueCreatedCount = () => {
    const { endMonth } = prop
    let chartDataset = { created: 0 }
    let issueListDataSortedByCreatedAt = issueListData

    issueListDataSortedByCreatedAt.sort((a, b) => a.createdAt - b.createdAt)
    if (issueListDataSortedByCreatedAt.length > 0) {
      let index
      let month = moment(endMonth)
      index = issueListDataSortedByCreatedAt.findIndex(issue => {
        return moment(issue.createdAt).year() > month.year() || moment(issue.createdAt).year() === month.year() && moment(issue.createdAt).month() > month.month()
      })
      chartDataset.created = (index === -1 ? issueListData.length : index)
    }

    setIssueOpenedMetric(chartDataset)
  }

  const getIssueClosedCount = () => {
    const { endMonth } = prop
    let chartDataset = { closed: 0 }
    let issueListDataSortedByClosedAt = issueListData

    issueListDataSortedByClosedAt.sort((a, b) => a.closedAt - b.closedAt)
    if (issueListDataSortedByClosedAt.length > 0) {
      let index
      let month = moment(endMonth)
      index = issueListDataSortedByClosedAt.findIndex(issue => {
        return moment(issue.closedAt).year() > month.year() || moment(issue.closedAt).year() === month.year() && moment(issue.closedAt).month() > month.month()
      })
      chartDataset.closed = (index === -1 ? issueListData.length : index)
    }

    setIssueClosedMetric(chartDataset)
  }

  const setIssueOpenedMetric = (chartDataset) => {
    let job = { id: {}, job: {}, views: {} }
    job.id = '1'
    job.job = "Created"
    job.views = chartDataset.created
    setJobs([job])
  }

  const setIssueClosedMetric = (chartDataset) => {
    let job = { id: {}, job: {}, views: {} }
    job.id = '2'
    job.job = "Closed"
    job.views = chartDataset.closed
    setJobs(prevArray => [...prevArray, job])
  }

  return (
    <div>
      <div>
        <ul className={classes.totalJobViewsGrid}>
          {jobs?.map(job => {
            return (
              <li className={classes.jobViewsBlock} key={job?.id}>
                <span className={classes.jobTitle}>{job?.job}</span>

                <div className={classes.jobViewsContainer}>
                  <span className={classes.jobViews}>{job?.views}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    endMonth: state.selectedMonth.endMonth
  }
}

export default connect(mapStateToProps)(IssueViews);
