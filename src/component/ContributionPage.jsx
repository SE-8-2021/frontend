import { useEffect, useState } from 'react'
import { Backdrop, CircularProgress } from '@mui/material'
import {makeStyles} from "@mui/styles";
import ProjectAvatar from './ProjectAvatar'
import Axios from 'axios'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import Chart from 'react-google-charts'

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: '10px',
  },
  chartContainer: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
    minWidth: '30px',
  },
  chart: {
    width: '67%',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
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
    width: '95%'
  },
}))

function ContributionPage(prop) {

  const classes = useStyles()
  const [commitListData, setCommitListData] = useState([])
  const [dataForMemberCommitPieChart, setDataForMemberCommitPieChart] = useState({ data: [] })
  const [dataForMemberCommitBarChart, setDataForMemberCommitBarChart] = useState({ data: [] })
  const [currentProject, setCurrentProject] = useState({})

  const [open, setOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen(!open);
  };

  const projectId = localStorage.getItem("projectId")
  const jwtToken = localStorage.getItem("jwtToken")
  const memberId = localStorage.getItem("memberId")

  // Get current project
  useEffect(() => {
    Axios.get(`http://localhost:9100/pvs-api/project/${memberId}/${projectId}`,
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
          setLoading(false)
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

  const getCommitFromGitLab = () => {
    const gitlabRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'gitlab')
    if (gitlabRepo !== undefined) {
      const query = gitlabRepo.url.split("gitlab.com/")[1]
      Axios.post(`http://localhost:9100/pvs-api/gitlab/commits/${query}`, "",
        { headers: { "Authorization": `${jwtToken}` } })
        .then(() => {
          getGitLabCommitFromDB()
          setLoading(false)
        })
        .catch((e) => {
          alert(e.response?.status)
          console.error(e)
        })
    }
  }

  const getGitLabCommitFromDB = () => {
    const gitlabRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'gitlab')
    if (gitlabRepo !== undefined) {
      const query = gitlabRepo.url.split("gitlab.com/")[1]
      Axios.get(`http://localhost:9100/pvs-api/gitlab/commits/${query}`,
        { headers: { "Authorization": `${jwtToken}` } })
        .then((response) => {
          setCommitListData(previousArray => [...previousArray, ...response.data])
        })
        .catch((e) => {
          alert(e.response?.status)
          console.error(e)
        })
    }
  }

  const handleClick = () => setLoading(true);

  // Default get commits from database
  useEffect(() => {
    if (Object.keys(currentProject).length !== 0) {
      handleToggle()
      getGitHubCommitFromDB()
      getGitLabCommitFromDB()
      handleClose()
    }
  }, [currentProject, prop.startMonth, prop.endMonth])

  // To reduce loading time, it will get/update commits from GitHub/GitLab only if the reload button is clicked.
  useEffect(() => {
    if (isLoading) {
      const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
      const gitlabRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'gitlab')
      if (githubRepo !== undefined) {
        getCommitFromGitHub()
      }
      if (gitlabRepo !== undefined) {
        getCommitFromGitLab()
      }
    }
  }, [isLoading]);

  // Generate commits pie chart
  useEffect(() => {
    let chartDataset = {
      labels: [],
      data: {}
    }
    new Set(commitListData.map(commit => commit.authorName)).forEach(author => {
      chartDataset.data[author] = 0
      chartDataset.labels.push(author)
    })
    commitListData.forEach(commitData => {
      chartDataset.data[commitData.authorName] += 1
    })
    setDataForMemberCommitPieChart([["Member", "Numbers of commits"]])
    chartDataset.labels.forEach(member => {
      setDataForMemberCommitPieChart(previousArray => [...previousArray, [member.replace("\"", "").replace("\"", ""), chartDataset.data[member]]])
    })
  }, [commitListData])

  // Generate code base bar chart
  useEffect(() => {
    let chartDataset_Addition = {
      labels: [],
      data: {}
    }
    let chartDataset_Deletion = {
      labels: [],
      data: {}
    }
    new Set(commitListData.map(commit => commit.authorName)).forEach(author => {
      chartDataset_Addition.data[author] = 0
      chartDataset_Addition.labels.push(author)
      chartDataset_Deletion.data[author] = 0
      chartDataset_Deletion.labels.push(author)
    })
    commitListData.forEach(commitData => {
      chartDataset_Addition.data[commitData.authorName] += commitData.additions
      chartDataset_Deletion.data[commitData.authorName] += commitData.deletions
    })
    setDataForMemberCommitBarChart([["Member", "Additions", "Deletions"]])
    chartDataset_Addition.labels.forEach(member => {
      setDataForMemberCommitBarChart(previousArray => [...previousArray, [member.replace("\"", "").replace("\"", ""), chartDataset_Addition.data[member], chartDataset_Deletion.data[member]]])
    })
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
          <h2 className={ classes.title }>{currentProject ? currentProject.projectName : ""}</h2>
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

export default connect(mapStateToProps)(ContributionPage);
