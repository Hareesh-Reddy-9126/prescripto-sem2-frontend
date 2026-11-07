import { useContext, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import EmptyState from '../components/EmptyState.jsx'
import OrderCard from '../components/OrderCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import StatusTimeline from '../components/StatusTimeline.jsx'
import { PharmacistContext } from '../context/PharmacistContext.jsx'

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Processing', value: 'processing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
]

const ACTION_OPTIONS = [
  { label: 'Accept order', value: 'accepted' },
  { label: 'Processing', value: 'processing' },
  { label: 'Ready for pickup', value: 'ready' },
  { label: 'Mark as shipped', value: 'shipped' },
  { label: 'Complete order', value: 'completed' },
  { label: 'Reject order', value: 'rejected' },
]

const Orders = () => {
  const { orders, fetchOrders, fetchOrderDetail, updateOrderStatus, fetchTimeline } = useContext(PharmacistContext)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [note, setNote] = useState('')
  const [nextStatus, setNextStatus] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    if (typeof fetchOrders === 'function') {
      fetchOrders({ status: statusFilter || undefined, search: search || undefined })
    }
  }, [statusFilter, search, fetchOrders])

  const filteredOrders = useMemo(() => {
    const collection = Array.isArray(orders) ? orders : []
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return collection

    return collection.filter((order) =>
      [order.orderNumber, order?.patientSnapshot?.name, order?.patientSnapshot?.phone]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    )
  }, [orders, search])

  const handleSelectOrder = async (order) => {
    setDetailLoading(true)
    const detailed = await fetchOrderDetail(order._id)
    const history = await fetchTimeline(order._id)
    setSelectedOrder({ ...order, ...(detailed ?? {}) })
    setTimeline(Array.isArray(history) ? history : [])
    setNextStatus('')
    setNote('')
    setDetailLoading(false)
  }

  const handleStatusUpdate = async (event) => {
    event.preventDefault()
    if (!selectedOrder || !nextStatus) return
    const result = await updateOrderStatus({ orderId: selectedOrder._id, status: nextStatus, note })
    if (result.success) {
      const detailed = await fetchOrderDetail(selectedOrder._id)
      const history = await fetchTimeline(selectedOrder._id)
      setSelectedOrder({ ...selectedOrder, ...(detailed ?? {}) })
      setTimeline(Array.isArray(history) ? history : [])
      setNote('')
      setNextStatus('')
    }
  }

  const handleShareNote = async () => {
    if (!selectedOrder || !note.trim()) return
    const result = await updateOrderStatus({ orderId: selectedOrder._id, status: selectedOrder.status, note })
    if (result.success) {
      const detailed = await fetchOrderDetail(selectedOrder._id)
      const history = await fetchTimeline(selectedOrder._id)
      setSelectedOrder({ ...selectedOrder, ...(detailed ?? {}) })
      setTimeline(Array.isArray(history) ? history : [])
      setNote('')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="flex flex-col gap-6 md:flex-row">
        <section className="md:w-[55%]">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Orders</h2>
                <p className="text-sm text-slate-500">Manage incoming prescriptions and keep patients updated.</p>
              </div>
              <select
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              placeholder="Search by order number or patient"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="mt-4 space-y-4">
            {filteredOrders.length === 0 ? (
              <EmptyState
                title="No orders found"
                description="Once a patient picks your pharmacy during checkout, their order will appear here."
              />
            ) : (
              filteredOrders.map((order) => (
                <OrderCard key={order._id} order={order} onSelect={handleSelectOrder} />
              ))
            )}
          </div>
        </section>

        <section className="flex-1">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {detailLoading && <p className="text-sm text-slate-500">Loading order details…</p>}
              {!detailLoading && !selectedOrder && (
                <EmptyState
                  title="Select an order"
                  description="Pick an order from the list to view prescription details and update the status."
                />
              )}
              {!detailLoading && selectedOrder && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">Order #{selectedOrder.orderNumber}</p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedOrder?.patientSnapshot?.name}</h3>
                      <p className="text-sm text-slate-500">{selectedOrder?.patientSnapshot?.phone}</p>
                    </div>
                    <StatusBadge status={selectedOrder.status} />
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-700">Delivery method</p>
                    <p className="mt-1 capitalize">{selectedOrder?.logistics?.method || 'pickup'}</p>
                    {selectedOrder?.logistics?.trackingNumber && (
                      <p className="mt-1 text-xs text-slate-500">Tracking #{selectedOrder.logistics.trackingNumber}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Prescription</h4>
                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                      {selectedOrder?.prescriptionSnapshot?.medications?.length === 0 && (
                        <li>No medicines listed.</li>
                      )}
                      {selectedOrder?.prescriptionSnapshot?.medications?.map((item, index) => (
                        <li key={`${item.name}-${index}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                          <p className="font-medium text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            {item.dosage && `${item.dosage} · `}
                            {item.frequency} · {item.duration}
                          </p>
                          {item.remarks && <p className="mt-1 text-xs text-slate-500">{item.remarks}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Status timeline</h4>
                    <div className="mt-3">
                      <StatusTimeline items={timeline} />
                    </div>
                  </div>

                  <form onSubmit={handleStatusUpdate} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Move order to
                      </label>
                      <select
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={nextStatus}
                        onChange={(event) => setNextStatus(event.target.value)}
                      >
                        <option value="">Select next status</option>
                        {ACTION_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Notes for patient (optional)
                      </label>
                      <textarea
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        rows={3}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Add a quick update to reassure the patient"
                      />
                      <button
                        type="button"
                        onClick={handleShareNote}
                        disabled={!note.trim()}
                        className="mt-2 w-full rounded-lg border border-brand-500 px-3 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                      >
                        Share medication note
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={!nextStatus}
                      className="w-full rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
                    >
                      Update status
                    </button>
                  </form>

                  <div className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
                    Last updated{' '}
                    {selectedOrder?.updatedAt ? dayjs(selectedOrder.updatedAt).format('DD MMM YYYY, HH:mm') : 'Recently'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Orders
