import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '@/components/shell/AppShell/AppShell'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import TodayPage from '@/pages/TodayPage'
import TasksPage from '@/pages/TasksPage'
import TaskDetailPage from '@/pages/TaskDetailPage'
import TaskCreatePage from '@/pages/TaskCreatePage'
import TaskSeriesPage from '@/pages/TaskSeriesPage'
import CalendarPage from '@/pages/CalendarPage'
import RhizomePage from '@/pages/RhizomePage'
import GardenPage from '@/pages/GardenPage'
import BedListPage from '@/pages/BedListPage'
import BedDetailPage from '@/pages/BedDetailPage'
import BedCreatePage from '@/pages/BedCreatePage'
import ContainerListPage from '@/pages/ContainerListPage'
import ContainerDetailPage from '@/pages/ContainerDetailPage'
import ContainerCreatePage from '@/pages/ContainerCreatePage'
import PlantsPage from '@/pages/PlantsPage'
import PlantDetailPage from '@/pages/PlantDetailPage'
import PlantCreatePage from '@/pages/PlantCreatePage'
import ProjectsPage from '@/pages/ProjectsPage'
import ProjectDetailPage from '@/pages/ProjectDetailPage'
import ProjectCreatePage from '@/pages/ProjectCreatePage'
import ProposalDetailPage from '@/pages/ProposalDetailPage'
import IncidentsPage from '@/pages/IncidentsPage'
import IncidentDetailPage from '@/pages/IncidentDetailPage'
import ActivityPage from '@/pages/ActivityPage'
import SettingsPage from '@/pages/SettingsPage'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/app/today" replace /> },
          { path: 'today', element: <TodayPage /> },

          { path: 'tasks', element: <TasksPage /> },
          { path: 'tasks/week', element: <TasksPage /> },
          { path: 'tasks/project/:id', element: <TasksPage /> },
          { path: 'tasks/kind/:type', element: <TasksPage /> },
          { path: 'tasks/area', element: <TasksPage /> },
          { path: 'tasks/progress', element: <TasksPage /> },
          { path: 'tasks/new', element: <TaskCreatePage /> },
          { path: 'tasks/series/:id', element: <TaskSeriesPage /> },
          { path: 'tasks/:id', element: <TaskDetailPage /> },

          { path: 'calendar', element: <CalendarPage /> },

          { path: 'rhizome', element: <RhizomePage /> },
          { path: 'rhizome/:threadId', element: <RhizomePage /> },

          { path: 'garden', element: <GardenPage /> },
          { path: 'beds', element: <BedListPage /> },
          { path: 'beds/new', element: <BedCreatePage /> },
          { path: 'beds/:id', element: <BedDetailPage /> },
          { path: 'containers', element: <ContainerListPage /> },
          { path: 'containers/new', element: <ContainerCreatePage /> },
          { path: 'containers/:id', element: <ContainerDetailPage /> },
          { path: 'plants', element: <PlantsPage /> },
          { path: 'plants/new', element: <PlantCreatePage /> },
          { path: 'plants/:id', element: <PlantDetailPage /> },

          { path: 'projects', element: <ProjectsPage /> },
          { path: 'projects/new', element: <ProjectCreatePage /> },
          { path: 'projects/:id', element: <ProjectDetailPage /> },
          { path: 'projects/:id/proposals/:proposalId', element: <ProposalDetailPage /> },

          { path: 'incidents', element: <IncidentsPage /> },
          { path: 'incidents/:id', element: <IncidentDetailPage /> },

          { path: 'activity', element: <ActivityPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
