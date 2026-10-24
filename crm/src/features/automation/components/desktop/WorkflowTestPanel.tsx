import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FlaskConical } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { listCustomers } from '@/features/customers/services/customerService'
import { useTestWorkflow } from '@/features/automation/hooks/useWorkflowEngine'
import { WorkflowRunSteps } from '@/features/automation/components/desktop/WorkflowRunSteps'
import { ORDER_TRIGGERS, type Workflow } from '@/features/automation/types/automation'
import { cn } from '@/lib/utils'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const ALL_CUSTOMERS = { search: '', page: 1, pageSize: 1000, sortBy: 'name' } as const

/**
 * Book 3 §3 Test/Simulate mode: pretend the trigger fired for one real
 * customer and show the path. Never sends a message or changes points;
 * the test is logged in the run log.
 */
export function WorkflowTestPanel({ workflow }: { workflow: Workflow }) {
  const customers = useQuery({ queryKey: ['customers', 'list', ALL_CUSTOMERS], queryFn: () => listCustomers(ALL_CUSTOMERS) })
  const [customerId, setCustomerId] = useState('')
  const [orderValue, setOrderValue] = useState('850')
  const testRun = useTestWorkflow(workflow.id)
  const needsOrder = ORDER_TRIGGERS.includes(workflow.triggerType)
  const orderValid = !needsOrder || /^\d+$/.test(orderValue)

  return (
    <Card>
      <CardHeader>
        <CardSectionHeading>Test on a customer</CardSectionHeading>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="test-customer" className="text-body-sm font-medium">
              Customer
            </label>
            <select
              id="test-customer"
              className={selectClassName}
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value)
                testRun.reset()
              }}
            >
              <option value="">{customers.isPending ? 'Loading customers…' : 'Choose a customer…'}</option>
              {(customers.data?.items ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.orderCount} orders · {c.loyaltyPoints ?? 0} pts
                </option>
              ))}
            </select>
          </div>
          {needsOrder && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="test-order-value" className="text-body-sm font-medium">
                Order value (₹)
              </label>
              <Input
                id="test-order-value"
                inputMode="numeric"
                className="w-32"
                value={orderValue}
                aria-invalid={!orderValid}
                onChange={(e) => {
                  setOrderValue(e.target.value)
                  testRun.reset()
                }}
              />
              {!orderValid && <p className="text-caption text-destructive">Enter a whole number.</p>}
            </div>
          )}
          <button
            type="button"
            disabled={!customerId || !orderValid || testRun.isPending}
            onClick={() =>
              testRun.mutate({ customerId, context: needsOrder ? { orderValue: Number(orderValue) } : {} })
            }
            className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'self-start')}
          >
            <FlaskConical className="size-4" />
            {testRun.isPending ? 'Testing…' : 'Run test'}
          </button>
          <p className="text-caption text-muted-foreground">
            Pretends the trigger just happened for this customer. Nothing is sent and no points are given; the test is
            saved in the run log below.
          </p>
          {testRun.isError && <p className="text-caption text-destructive">Couldn't run the test. Please try again.</p>}
        </div>

        <div aria-live="polite">
          {testRun.data ? (
            <div className="flex flex-col gap-2">
              <p className="text-body-sm font-medium">
                {testRun.data.completed ? 'All conditions passed — the actions would run.' : 'A condition failed — nothing would run.'}
              </p>
              <WorkflowRunSteps run={testRun.data} />
            </div>
          ) : (
            <p className="text-body-sm text-muted-foreground">The result shows here, step by step.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
