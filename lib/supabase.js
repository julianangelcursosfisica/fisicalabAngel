import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://abgiznvycemsqoxwvczn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiZ2l6bnZ5Y2Vtc3FveHd2Y3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5OTU4OTYsImV4cCI6MjA5MDU3MTg5Nn0.2czoD0t3IpXa78HXNgX8olqzE9xNnzdYwWlS6GqGOUA'
  )
}
