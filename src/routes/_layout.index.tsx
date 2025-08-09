
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Please select a record type:
    </div>
  )
}
