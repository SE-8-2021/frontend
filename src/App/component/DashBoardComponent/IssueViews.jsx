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

// const jobViews = [
//   {
//     id: 1,
//     job: "Opened",
//     views: 150,
//   },
//   {
//     id: 2,
//     job: "Closed",
//     views: 25,
//   },
// ];

function IssueViews(prop) {
  const classes = useStyles()
  const [currentProject, setCurrentProject] = useState({})
  const [issueListData, setIssueListData] = useState([])
  const [jobs, setJobs] = useState([])
  const projectId = localStorage.getItem("projectId")
  const jwtToken = localStorage.getItem("jwtToken")

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
    console.log('gettingGithubRepo', githubRepo)
    if (githubRepo !== undefined) {
      const query = githubRepo.url.split("github.com/")[1]
      console.log('query', query)

      // todo need reafctor with async
      Axios.get(`http://localhost:9100/pvs-api/github/issues/${query}`,
        { headers: { "Authorization": `${jwtToken}` } })
        .then((response) => {
          console.log(response.data)
          setIssueListData(response.data)
        })
        .catch((e) => {
          alert(e);
          console.error(e)
        })
    }
  }

  useEffect(() => {
    if (Object.keys(currentProject).length !== 0) {
      getIssueFromGitHub()
    }
  }, [currentProject, prop.startMonth, prop.endMonth])

  useEffect(() => {
    generateIssueViewData()
  }, [issueListData, prop.startMonth, prop.endMonth])

  const generateIssueViewData = () => {
    const { endMonth } = prop
    let chartDataset = { created: 0, closed: 0 }
    let issueListDataSortedByCreatedAt = issueListData
    let issueListDataSortedByClosedAt = issueListData
    console.log('issueData', issueListData)

    issueListDataSortedByCreatedAt.sort((a, b) => a.createdAt - b.createdAt)
    issueListDataSortedByClosedAt.sort((a, b) => a.closedAt - b.closedAt)

    if (issueListDataSortedByCreatedAt.length > 0) {
      let index
      let month = moment(endMonth)
      index = issueListDataSortedByCreatedAt.findIndex(issue => {
        return moment(issue.createdAt).year() > month.year() || moment(issue.createdAt).year() === month.year() && moment(issue.createdAt).month() > month.month()
      })
      console.log('issueListDataLength', issueListData.length)
      chartDataset.created = (index === -1 ? issueListData.length : index)
      console.log('dataset.created', chartDataset.created)

      index = issueListDataSortedByClosedAt.findIndex(issue => {
        return moment(issue.closedAt).year() > month.year() || moment(issue.closedAt).year() === month.year() && moment(issue.closedAt).month() > month.month()
      })
      chartDataset.closed = (index === -1 ? issueListData.length : index)
    }

    // let job = { id:{}, job:{}, views:{} }
    // job.id = '1'
    // job.job = "Created"
    // job.views = chartDataset.created
    // // setJobs(prevArray => [...prevArray, job])
    // setJobs([job])
    setIssueOpenedMetric(chartDataset)

    // let job1 = { id:{}, job:{}, views:{} }
    // job1.id = '2'
    // job1.job = "Closed"
    // job1.views = chartDataset.closed
    // console.log('closed',job1.views)
    // setJobs(prevArray => [...prevArray, job1])
    // console.log('jobs', jobs)
    setIssueClosedMetric(chartDataset)
  }

  const setIssueOpenedMetric = (chartDataset) => {
    // console.log('created', dataForIssueMetrics.created)
    let job = { id:{}, job:{}, views:{} }
    job.id = '1'
    job.job = "Created"
    job.views = chartDataset.created
    setJobs([job])
    // console.log('setOpen', jobs)
  }

  const setIssueClosedMetric = (chartDataset) => {
    let job = { id:{}, job:{}, views:{} }
    job.id = '2'
    job.job = "Closed"
    job.views = chartDataset.closed
    setJobs(prevArray => [...prevArray, job])
    console.log('setClose', jobs)
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
                  <span className={classes.jobViews}>{JSON.stringify(job?.views)}</span>
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
