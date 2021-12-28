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
    border: '1px solid #BB3D00',
    backgroundColor: '#FFDAC8',
    color: '#BB3D00',
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

function CodeBaseViews(prop) {
  const classes = useStyles()
  const [jobs, setJobs] = useState([])
  const [commitListData, setCommitListData] = useState([])
  const [currentProject, setCurrentProject] = useState({})
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

  const getCommitFromGitHub = () => {
    const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
    if (githubRepo !== undefined) {
      const query = githubRepo.url.split("github.com/")[1]
      Axios.post(`http://localhost:9100/pvs-api/github/commits/${query}`, "",
        { headers: { "Authorization": `${jwtToken}` } })
        .then(() => {
          getGitHubCommitFromDB()
          // setLoading(false)
        })
        .catch((e) => {
          alert(e.response?.status)
          console.error(e)
        })
    }
  }

  const getGitHubCommitFromDB = () => {
    const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
    if (githubRepo !== undefined) {
      const query = githubRepo.url.split("github.com/")[1]
      // todo need refactor with async
      Axios.get(`http://localhost:9100/pvs-api/github/commits/${query}`,
        { headers: { "Authorization": `${jwtToken}` } })
        .then((response) => {
          setCommitListData(response.data)
        })
        .catch((e) => {
          alert(e.response?.status)
          console.error(e)
        })
    }
  }

  useEffect(() => {
    if (Object.keys(currentProject).length !== 0) {
      getCommitFromGitHub()
    }
  }, [currentProject, prop.startMonth, prop.endMonth])

  //Get additions and deletions
  useEffect(() => {
    getAdditions()
    getDeletions()
  }, [commitListData, prop.startMonth, prop.endMonth])

  const getAdditions = () => {
    const { startMonth, endMonth } = prop

    let chartDataset = { additions: 0 }
    for (let month = moment(startMonth); month <= moment(endMonth); month = month.add(1, 'months')) {
      chartDataset.additions += (commitListData.filter(commit => {
        return moment(commit.committedDate).format("YYYY-MM") === month.format("YYYY-MM")
      })
        .reduce(function (additionSum, currentCommit) {
          return additionSum + currentCommit.additions;
        }, 0))
    }
    
    setAdditions(chartDataset)
  }

  const getDeletions = () => {
    const { startMonth, endMonth } = prop

    let chartDataset = { deletions: 0 }
    for (let month = moment(startMonth); month <= moment(endMonth); month = month.add(1, 'months')) {
      chartDataset.deletions += (commitListData.filter(commit => {
        return moment(commit.committedDate).format("YYYY-MM") === month.format("YYYY-MM")
      })
        .reduce(function (deletionSum, currentCommit) {
          return deletionSum + currentCommit.deletions;
        }, 0))
    }
    
    setDeletions(chartDataset)
  }

  const setAdditions = (chartDataset) => {
    let job = { id:{}, job:{}, views:{} }
    job.id = '1'
    job.job = "Additions"
    job.views = chartDataset.additions
    setJobs([job])
  }

  const setDeletions =(chartDataset) => {
    let job = { id:{}, job:{}, views:{} }
    job.id = '2'
    job.job = "Deletions"
    job.views = chartDataset.deletions
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
    startMonth: state.selectedMonth.startMonth,
    endMonth: state.selectedMonth.endMonth
  }
}

export default connect(mapStateToProps)(CodeBaseViews);
