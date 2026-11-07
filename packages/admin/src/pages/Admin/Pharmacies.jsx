import { useContext, useEffect, useMemo, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const Pill = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm border ${active ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700 border-slate-200'}`}>{label}</button>
)

const Pharmacies = () => {
  const { aToken, pharmacies, getPharmacies, reviewPharmacy, togglePharmacyActive } = useContext(AdminContext)
  const [tab, setTab] = useState('pending')
  const list = useMemo(() => (tab === 'pending' ? pharmacies.pending : pharmacies.approved), [tab, pharmacies])

  useEffect(() => {
    if (!aToken) return
    getPharmacies('pending')
    getPharmacies('approved')
  }, [aToken, getPharmacies])

  return (
    <div className='m-5 max-h-[90vh] overflow-y-auto'>
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-lg font-medium'>Pharmacies</h1>
        <div className='flex gap-2'>
          <Pill label="Pending" active={tab==='pending'} onClick={()=>setTab('pending')} />
          <Pill label="Approved" active={tab==='approved'} onClick={()=>setTab('approved')} />
        </div>
      </div>

      <div className='w-full overflow-x-auto rounded-xl border border-slate-200 bg-white'>
        <table className='min-w-full text-sm'>
          <thead className='bg-slate-50 text-slate-600'>
            <tr>
              <th className='px-4 py-3 text-left'>Name</th>
              <th className='px-4 py-3 text-left'>Owner</th>
              <th className='px-4 py-3 text-left'>Email</th>
              <th className='px-4 py-3 text-left'>Phone</th>
              <th className='px-4 py-3 text-left'>Address</th>
              <th className='px-4 py-3 text-left'>License</th>
              <th className='px-4 py-3 text-left'>Options</th>
              <th className='px-4 py-3 text-left'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p._id} className='border-t'>
                <td className='px-4 py-3'>{p.name}</td>
                <td className='px-4 py-3'>{p.ownerName}</td>
                <td className='px-4 py-3'>{p.email}</td>
                <td className='px-4 py-3'>{p.phone}</td>
                <td className='px-4 py-3'>
                  {[p?.address?.line1, p?.address?.line2, p?.address?.city, p?.address?.state, p?.address?.postalCode]
                    .filter(Boolean).join(', ')}
                </td>
                <td className='px-4 py-3'>{p.licenseNumber}</td>
                <td className='px-4 py-3'>{(p.deliveryOptions||[]).join(', ')}</td>
                <td className='px-4 py-3'>
                  {tab === 'pending' ? (
                    <div className='flex gap-2'>
                      <button onClick={()=>reviewPharmacy({ pharmacyId: p._id, approve: true })} className='rounded-lg bg-green-600 px-3 py-1.5 text-white'>Approve</button>
                      <button onClick={()=>{
                        const notes = prompt('Reason for rejection (optional):') || ''
                        reviewPharmacy({ pharmacyId: p._id, approve: false, notes })
                      }} className='rounded-lg bg-red-600 px-3 py-1.5 text-white'>Reject</button>
                    </div>
                  ) : (
                    <div className='flex items-center gap-3'>
                      <span className={`text-xs font-medium ${p.isActive ? 'text-green-700' : 'text-red-700'}`}>{p.isActive ? 'Active' : 'Disabled'}</span>
                      <button onClick={()=>togglePharmacyActive({ pharmacyId: p._id, isActive: !p.isActive })} className='rounded-lg border px-3 py-1.5'>
                        {p.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td className='px-4 py-10 text-center text-slate-500' colSpan={8}>No records</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Pharmacies
