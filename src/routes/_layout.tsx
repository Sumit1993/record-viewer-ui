import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState } from 'react'
import RecordTypeSidebar from '~/components/RecordTypeSidebar'

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
})

const recordTypes = ['Business', 'Building Permit', 'Zoning Variance']

function RouteComponent() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  return (
    <div style={{ display: 'flex' }}>
      <RecordTypeSidebar
        recordTypes={recordTypes}
        selectedType={selectedType ?? ''}
        onSelectType={setSelectedType}
      />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  )
}