import Login from '../component/Login'
import SelectProject from '../component/SelectProject'
import DashboardPage from '../component/DashboardPage'
import CommitsPage from '../component/CommitsPage'
import IssuesPage from '../component/IssuesPage'
import PullRequestsPage from '../component/PullRequestsPage'
import CodeBasePage from '../component/CodeBasePage'
import ComparisonPage from '../component/ComparisonPage'
import ContributionPage from '../component/ContributionPage'
import CodeCoveragePage from '../component/CodeCoveragePage'
import BugsPage from '../component/BugsPage'
import CodeSmellsPage from '../component/CodeSmellsPage'
import DuplicationsPage from '../component/DuplicationsPage'
import TrelloBoardPage from '../component/TrelloBoardPage'

const routes = [
  { path: "/", redirect: true, to: "/select" },
  { path: "/login", component: Login, loginRequired: false },
  { path: "/select", component: SelectProject, loginRequired: true },
  { path: "/dashboard", component: DashboardPage, loginRequired: true },
  { path: "/commits", component: CommitsPage, loginRequired: true },
  { path: "/issues", component: IssuesPage, loginRequired: true },
  { path: "/pull_requests", component: PullRequestsPage, loginRequired: true },
  { path: "/codebase", component: CodeBasePage, loginRequired: true },
  { path: "/comparison", component: ComparisonPage, loginRequired: true },
  { path: "/contribution", component: ContributionPage, loginRequired: true },
  { path: "/code_coverage", component: CodeCoveragePage, loginRequired: true },
  { path: "/bugs", component: BugsPage, loginRequired: true },
  { path: "/code_smells", component: CodeSmellsPage, loginRequired: true },
  { path: "/duplications", component: DuplicationsPage, loginRequired: true },
  { path: "/trello_board", component: TrelloBoardPage, loginRequired: true },
]

export default routes
