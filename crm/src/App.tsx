import { Button } from '@/components/ui/button'

// Phase 1 foundation placeholder only — no navigation, shell, or business
// screens yet. Replaced once the application shell (FRONTEND_ARCHITECTURE.md
// §27 "Phase 3 — Application Shell") is built.
function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Broastin CRM / Growth OS</h1>
      <p className="text-muted-foreground">Foundation scaffold — no modules built yet.</p>
      <Button>Foundation ready</Button>
    </div>
  )
}

export default App
