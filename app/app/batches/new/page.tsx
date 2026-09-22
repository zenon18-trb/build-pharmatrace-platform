'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/app-shell/page-header'
import { useRole } from '@/components/app-shell/role-context'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { medicines } from '@/lib/domain/data'
import { roleOrgId } from '@/lib/config/navigation'

export default function NewBatchPage() {
  const router = useRouter()
  const { role } = useRole()
  const orgId = roleOrgId[role]
  const ownMedicines = medicines.filter((m) => m.manufacturerOrgId === orgId)

  const [medicineId, setMedicineId] = useState('')
  const [batchNumber, setBatchNumber] = useState('')
  const [manufacturingDate, setManufacturingDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const isValid =
    medicineId && batchNumber && manufacturingDate && expiryDate && quantity && unit

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div>
        <PageHeader title="Create batch" />
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-success-bg text-success">
              <CheckCircle2 className="size-6" />
            </span>
            <div>
              <p className="text-base font-medium text-text-primary">Batch submitted</p>
              <p className="mt-1 text-sm text-text-secondary">
                {batchNumber} has been recorded and is being submitted to the blockchain for
                provenance confirmation.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/app/batches">
                <Button variant="outline">Back to batches</Button>
              </Link>
              <Button
                onClick={() => {
                  setSubmitted(false)
                  setMedicineId('')
                  setBatchNumber('')
                  setManufacturingDate('')
                  setExpiryDate('')
                  setQuantity('')
                  setUnit('')
                }}
              >
                Create another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <Link
        href="/app/batches"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to batches
      </Link>

      <PageHeader
        title="Create batch"
        description="Record a new medicine batch and anchor its provenance on the blockchain."
      />

      <Card className="mx-auto max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="medicine">Medicine</FieldLabel>
                <Select
                  value={medicineId}
                  onValueChange={(value) => setMedicineId(value ?? '')}
                >
                  <SelectTrigger id="medicine" className="w-full">
                    <SelectValue placeholder="Select a medicine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {ownMedicines.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} · {m.strength}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {ownMedicines.length === 0 && (
                  <FieldDescription>
                    No medicines registered yet. Add a medicine before creating a batch.
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="batchNumber">Batch number</FieldLabel>
                <Input
                  id="batchNumber"
                  placeholder="e.g. PCM-2026-005"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="manufacturingDate">Manufacturing date</FieldLabel>
                  <Input
                    id="manufacturingDate"
                    type="date"
                    value={manufacturingDate}
                    onChange={(e) => setManufacturingDate(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="expiryDate">Expiry date</FieldLabel>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="e.g. 10000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="unit">Unit</FieldLabel>
                  <Input
                    id="unit"
                    placeholder="e.g. tablets, capsules, pens"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </Field>
              </div>

              <Alert>
                <AlertTitle>What happens next</AlertTitle>
                <AlertDescription>
                  The batch will be recorded in PharmaTrace and submitted to the blockchain for
                  a tamper-evident provenance record.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2">
                <Link href="/app/batches">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={!isValid}>
                  Create batch
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
