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
    border: '1px solid #b45309',
    backgroundColor: '#fef3c7',
    color: '#b45309',
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

function PullRequestsViews(prop) {
  const classes = useStyles()
  const [jobs, setJobs] = useState([])
  const [pullRequestListData, setPullRequestListData] = useState([])
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

  const getPullRequestsFromGitHub = () => {
    const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
    if (githubRepo !== undefined) {
      const query = githubRepo.url.split("github.com/")[1]

      // todo need reafctor with async
      Axios.get(`http://localhost:9100/pvs-api/github/pullRequests/${query}`,
        { headers: { "Authorization": `${jwtToken}` } })
        .then((response) => {
          if (response?.data) {
            setPullRequestListData(response.data)
          }
        })
        .catch((e) => {
          alert(e.response?.status);
          console.error(e)
        })
    }
  }

  useEffect(() => {
    if (Object.keys(currentProject).length !== 0) {
      handleToggle()
      getPullRequestsFromGitHub()
      handleClose()
    }
  }, [currentProject, prop.startMonth, prop.endMonth])

  //Get created count and merged count of pull requests
  useEffect(() => {
    getCreated()
    getMerged()
  }, [pullRequestListData, prop.startMonth, prop.endMonth])

  const getCreated = () => {
    const { endMonth } = prop

    let chartDataset = { created: 0 }
    let month = moment(endMonth)
    let pullRequestListDataSortedByCreatedAt = pullRequestListData
    let index
    
    // Sort data by date
    if (pullRequestListData !== undefined) {
      [].slice.call(pullRequestListDataSortedByCreatedAt).sort((a, b) => a.createdAt - b.createdAt);
    }

    // Calculate the number of pull requests for the last month in the selected range
    if (pullRequestListDataSortedByCreatedAt.length > 0) {
      index = pullRequestListDataSortedByCreatedAt.findIndex(pullRequest => {
        return moment(pullRequest.createdAt).year() > month.year() || moment(pullRequest.createdAt).year() === month.year() && moment(pullRequest.createdAt).month() > month.month()
      })
      chartDataset.created = (index === -1 ? pullRequestListData.length : index)
    }
    
    setCreated(chartDataset)
  }

  const getMerged = () => {
    const { endMonth } = prop

    let chartDataset = { merged: 0 }
    let month = moment(endMonth)
    let pullRequestListDataSortedByMergedAt = pullRequestListData
    let index
    let noMergeCount = 0
    
    // Sort data by date
    if (pullRequestListData !== undefined) {
      [].slice.call(pullRequestListDataSortedByMergedAt).sort((a, b) => a.mergedAt - b.mergedAt);
    }

    // Calculate the number of pull requests for the last month in the selected range
    if (pullRequestListDataSortedByMergedAt.length > 0) {
      index = pullRequestListDataSortedByMergedAt.findIndex(pullRequest => {
        console.log(moment(pullRequest.mergedAt).month())
        if (pullRequest.mergedAt == null) {
          noMergeCount += 1
        }
        return moment(pullRequest.mergedAt).year() > month.year() || moment(pullRequest.mergedAt).year() === month.year() && moment(pullRequest.mergedAt).month() > month.month()
      })
      chartDataset.merged = (index === -1 ? pullRequestListData.length - noMergeCount : index)
    }
    
    setMerged(chartDataset)
  }

  const setCreated = (chartDataset) => {
    let job = { id:{}, job:{}, views:{} }
    job.id = '1'
    job.job = "Created"
    job.views = chartDataset.created
    setJobs([job])
  }

  const setMerged =(chartDataset) => {
    let job = { id:{}, job:{}, views:{} }
    job.id = '2'
    job.job = "Merged"
    job.views = chartDataset.merged
    setJobs(prevArray => [...prevArray, job])
  }

  return (
    <div>
      <div className="">
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

export default connect(mapStateToProps)(PullRequestsViews);
