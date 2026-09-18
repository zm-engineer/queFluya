import { LoadingScreen } from '@/components/ui/loading-screen'

// Shown instantly while any dashboard-group page (which fetch from Supabase on
// the server) renders, so navigation never feels frozen.
export default function DashboardLoading() {
  return <LoadingScreen />
}
