import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

/**
 * 404 screen — docs/NAVIGATION.md §30: "Unknown routes must not silently
 * redirect to an unrelated page. A clear way back to the main application
 * is provided." Shared across both shells.
 */
export function NotFoundScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-h2 font-semibold">Page not found</h1>
      <p className="text-body text-muted-foreground">
        This screen hasn't been built yet, or the link is incorrect.
      </p>
      <Link to="/" className={buttonVariants({ variant: 'default' })}>
        Back to Broastin
      </Link>
    </div>
  )
}
