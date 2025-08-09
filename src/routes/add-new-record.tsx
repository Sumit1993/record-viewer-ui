import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/add-new-record')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/add-new-record"!</div>
}
