import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import ExitToApp from '@mui/icons-material/ExitToApp'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Code from '@mui/icons-material/Code'
import GpsFixed from '@mui/icons-material/GpsFixed'
import Compare from '@mui/icons-material/Compare'
import {
  AppBar,
  Collapse,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import { AiFillBug } from 'react-icons/ai'
import { IoGitCommitSharp, IoNuclear } from 'react-icons/io5'
import { GoIssueOpened } from 'react-icons/go'
import { HiChartPie, HiDocumentDuplicate } from 'react-icons/hi'
import { SiGithub, SiGitlab, SiSonarqube, SiTrello } from 'react-icons/si'
import { RiDashboardFill } from 'react-icons/ri'
import { BiGitPullRequest } from 'react-icons/bi'
import clsx from 'clsx'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import { connect } from 'react-redux'
import Axios from 'axios'
import DateAdapter from '@mui/lab/AdapterMoment'
import MobileDatePicker from '@mui/lab/MobileDatePicker'
import { setEndMonth, setStartMonth } from '../redux/action'
import logo_s from '../assets/images/s.png'
import logo_v from '../assets/images/v.png'
import logo_p from '../assets/images/p.png'

const drawerWidth = 240
const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    zIndex: '1',
    paddingTop: '4rem',
    position: 'relative',
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  drawerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  list: {
    height: '100%',
    width: 'auto',
  },
  logout: {
    position: 'absolute !important',
    margin: '.5em !important',
    right: 0,
  },
  menuList: {
    height: '100%',
  },
  monthSelector: {
    width: 240,
    padding: theme.spacing(1, 3, 1),
  },
  innerList: {
    backgroundColor: '#fafafa',
  },
}))

function Sidebar(prop) {
  // todo separate sidebar and appbar~~~

  const open = useState(true)[0]
  const history = useHistory()
  const classes = useStyles()
  const [currentProject, setCurrentProject] = useState(undefined)
  const [githubMenuOpen, setGithubMenuOpen] = useState(true)
  const [gitlabMenuOpen, setGitlabMenuOpen] = useState(true)
  const [sonarMenuOpen, setSonarMenuOpen] = useState(true)
  const [trelloMenuOpen, setTrelloMenuOpen] = useState(true)

  const buildTitleListItem = (text, Icon, open, setOpen) => (
    <ListItem button onClick={ () => {
      setOpen(!open)
    } }>
      <ListItemIcon>
        <Icon size={ 30 }/>
      </ListItemIcon>
      <ListItemText primary={ text }/>
      {open ? <ExpandLess/> : <ExpandMore/>}
    </ListItem>
  )

  const buildSmallListItem = (text, Icon, onClick) => (
    <ListItem button onClick={ onClick }>
      <ListItemIcon>
        <Icon size={ 24.5 }/>
      </ListItemIcon>
      <ListItemText primary={ text }/>
    </ListItem>
  )

  const buildSidebarList = () => (
    <div className={ classes.list } role="presentation">
      <List className={ classes.menuList } width="inher">
        {prop.currentProjectId !== 0
          && <div>

            {/* back to select page UI button */}
            <ListItem button onClick={ goToSelect }>
              <ListItemIcon>
                <ArrowBack/>
              </ListItemIcon>
              <ListItemText primary="Select"/>
            </ListItem>
            <Divider/>

            {/* dashboard UI button */}
            <Divider className={ classes.divider }/>
            <ListItem button onClick={ goToDashBoard }>
              <ListItemIcon>
                <RiDashboardFill size={ 30 }/>
              </ListItemIcon>
              <ListItemText primary="DashBoard"/>
            </ListItem>
            <Divider/>

            {/* github metrics UI button */}
            {currentProject
              && currentProject.repositoryDTOList.find(x => x.type === 'github')
              && <div>
                {buildTitleListItem('GitHub', SiGithub, githubMenuOpen, setGithubMenuOpen)}
                <Divider/>

                <Collapse in={ githubMenuOpen } timeout="auto" unmountOnExit>
                  <List component="div" disablePadding className={ classes.innerList }>
                    {buildSmallListItem('Commits', IoGitCommitSharp, goToCommit)}
                    {buildSmallListItem('Issues', GoIssueOpened, goToIssue)}
                    {buildSmallListItem('Pull Request', BiGitPullRequest, goToPullRequest)}
                    {buildSmallListItem('Code Base', Code, goToCodeBase)}
                    {buildSmallListItem('Comparison', Compare, goToComparison)}
                    {buildSmallListItem('Contribution', HiChartPie, goToContribution)}
                  </List>
                  <Divider/>
                </Collapse>
              </div>
            }

            {/* gitlab metrics UI button */}
            {currentProject
              && currentProject.repositoryDTOList.find(x => x.type === 'gitlab')
              && <div>
                {buildTitleListItem('GitLab', SiGitlab, gitlabMenuOpen, setGitlabMenuOpen)}
                <Divider/>

                <Collapse in={ gitlabMenuOpen } timeout="auto" unmountOnExit>
                  <List component="div" disablePadding className={ classes.innerList }>
                    {buildSmallListItem('Commits', IoGitCommitSharp, goToCommit)}
                    {buildSmallListItem('Issues', GoIssueOpened, goToIssue)}
                    {buildSmallListItem('Code Base', Code, goToCodeBase)}
                    {buildSmallListItem('Comparison', Compare, goToComparison)}
                    {buildSmallListItem('Contribution', HiChartPie, goToContribution)}
                  </List>
                  <Divider/>
                </Collapse>
              </div>
            }

            {/* sonar metrics UI button */}
            {currentProject
              && currentProject.repositoryDTOList.find(x => x.type === 'sonar')
              && <div>
                {buildTitleListItem('SonarQube', SiSonarqube, sonarMenuOpen, setSonarMenuOpen)}
                <Divider/>

                <Collapse in={ sonarMenuOpen } timeout="auto" unmountOnExit>
                  <List component="div" disablePadding className={ classes.innerList }>
                    {buildSmallListItem('Code Coverage', GpsFixed, goToCodeCoverage)}
                    {buildSmallListItem('Bugs', AiFillBug, goToBug)}
                    {buildSmallListItem('Code Smells', IoNuclear, goToCodeSmell)}
                    {buildSmallListItem('Duplications', HiDocumentDuplicate, goToDuplication)}
                  </List>
                  <Divider/>
                </Collapse>
              </div>
            }

            {/* trello metrics UI button */}
            {currentProject
              && currentProject.repositoryDTOList.find(x => x.type === 'trello')
              && <div>
                {buildTitleListItem('Trello', SiTrello, trelloMenuOpen, setTrelloMenuOpen)}
                <Divider/>

                <Collapse in={ trelloMenuOpen } timeout="auto" unmountOnExit>
                  <List component="div" disablePadding className={ classes.innerList }>
                    {buildSmallListItem('board', IoGitCommitSharp, goToTrelloBoard)}
                  </List>
                  <Divider/>
                </Collapse>
              </div>
            }
          </div>
        }
      </List>
    </div>
  )

  const logout = () => {
    localStorage.clear()
    history.push('/login')
  }

  const goToSelect = () => {
    history.push('/select')
  }

  const goToDashBoard = () => {
    history.push('/dashboard')
  }

  const goToCommit = () => {
    history.push('/commits')
  }

  const goToIssue = () => {
    history.push('/issues')
  }

  const goToPullRequest = () => {
    history.push('/pull_requests')
  }

  const goToCodeBase = () => {
    history.push('/codebase')
  }

  const goToComparison = () => {
    history.push('/comparison')
  }

  const goToContribution = () => {
    history.push('/contribution')
  }

  const goToCodeCoverage = () => {
    history.push('/code_coverage')
  }

  const goToBug = () => {
    history.push('/bugs')
  }

  const goToCodeSmell = () => {
    history.push('/code_smells')
  }

  const goToDuplication = () => {
    history.push('/duplications')
  }

  const goToTrelloBoard = () => {
    history.push('/trello_board')
  }

  const jwtToken = localStorage.getItem('jwtToken')
  const memberId = localStorage.getItem('memberId')

  const headers = { ...(jwtToken && { Authorization: jwtToken }) }

  const loadInitialProjectInfo = async() => {
    try {
      const response = await Axios.get(`http://localhost:9100/pvs-api/project/${memberId}/${prop.currentProjectId}`, headers)
      setCurrentProject(response.data)
    }
    catch (e) {
      alert(e?.response?.status)
      console.error(e)
    }
  }

  useEffect(() => {
    if (prop.currentProjectId && prop.currentProjectId !== '0')
      loadInitialProjectInfo()
  }, [prop.currentProjectId])

  return (
    <div className={ classes.root }>
      <CssBaseline/>
      <AppBar
        position="fixed"
        className={ clsx(classes.appBar, {
          [classes.appBarShift]: open,
        }) }
      >
        <Toolbar>
          <img src={ logo_p } alt={ '' }/>
          <img src={ logo_v } alt={ '' }/>
          <img src={ logo_s } alt={ '' }/>
          <div className={ classes.monthSelector }>
            <LocalizationProvider dateAdapter={ DateAdapter }>
              <MobileDatePicker
                className={ classes.datepicker }
                fullWidth
                focused={ false }
                openTo="year"
                views={ ['year', 'month'] }
                label="Start Month and Year"
                value={ prop.startMonth }
                onChange={ prop.setStartMonth }
                renderInput={ params => <TextField { ...params } /> }
              />
            </LocalizationProvider>
          </div>
          <div className={ classes.monthSelector }>
            <LocalizationProvider dateAdapter={ DateAdapter }>
              <MobileDatePicker
                className={ classes.datepicker }
                fullWidth
                focused={ false }
                openTo="year"
                views={ ['year', 'month'] }
                label="End Month and Year"
                value={ prop.endMonth }
                onChange={ prop.setEndMonth }
                renderInput={ params => <TextField { ...params } /> }
              />
            </LocalizationProvider>
          </div>
          <IconButton className={ classes.logout } onClick={ logout }>
            <ExitToApp/>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={ clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }) }
        classes={ {
          paper: clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        } }
      >
        <Divider/>
        {buildSidebarList()}
      </Drawer>
      <main className={ classes.content }>
        <div className={ classes.drawerContent }/>
        {prop.children}
      </main>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    startMonth: state.selectedMonth.startMonth,
    endMonth: state.selectedMonth.endMonth,
    currentProjectId: state.currentProjectId,
  }
}

const mapActionToProps = (dispatch) => {
  return {
    setStartMonth: startMonth => dispatch(setStartMonth(startMonth)),
    setEndMonth: endMonth => dispatch(setEndMonth(endMonth)),
  }
}

export default connect(mapStateToProps, mapActionToProps)(Sidebar)
