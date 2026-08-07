import Tabs from '@/components/ui/Tabs'

interface Props {
  designSystemTab: React.ReactNode
  architectureTab: React.ReactNode
  claudeWorkflowTab: React.ReactNode
}

export default function GuidesTabs({ designSystemTab, architectureTab, claudeWorkflowTab }: Props) {
  return (
    <Tabs
      tabs={[
        { key: 'design-system', label: 'Design System', content: designSystemTab },
        { key: 'architecture', label: 'Architecture', content: architectureTab },
        { key: 'claude-workflow', label: 'Working with Claude', content: claudeWorkflowTab },
      ]}
    />
  )
}
