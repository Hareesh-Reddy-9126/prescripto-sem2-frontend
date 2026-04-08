import { useCallback, useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const PAGE_SIZES = [10, 25, 50, 100]

const formatCell = (value) => {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const DatabaseViewer = () => {
  const { aToken, getDatabaseTables, getDatabaseRows } = useContext(AdminContext)

  const [database, setDatabase] = useState('')
  const [serverVersion, setServerVersion] = useState('')
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState('')

  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 25, totalRows: 0, totalPages: 1 })

  const [loadingTables, setLoadingTables] = useState(false)
  const [loadingRows, setLoadingRows] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const page = pagination.page
  const limit = pagination.limit

  const loadTables = useCallback(async () => {
    setLoadingTables(true)
    setErrorMessage('')
    try {
      const data = await getDatabaseTables()
      if (!data) {
        setErrorMessage('Failed to load database metadata')
        return
      }

      setDatabase(data.database || '')
      setServerVersion(data.serverVersion || '')
      const safeTables = Array.isArray(data.tables) ? data.tables : []
      setTables(safeTables)

      if (safeTables.length > 0) {
        setSelectedTable((current) => (current && safeTables.some((table) => table.name === current) ? current : safeTables[0].name))
      } else {
        setSelectedTable('')
      }
    } finally {
      setLoadingTables(false)
    }
  }, [getDatabaseTables])

  const loadRows = useCallback(async (tableName, targetPage, targetLimit) => {
    if (!tableName) return

    setLoadingRows(true)
    setErrorMessage('')
    try {
      const data = await getDatabaseRows({ table: tableName, page: targetPage, limit: targetLimit })
      if (!data) {
        setColumns([])
        setRows([])
        setErrorMessage(`Failed to load rows for table ${tableName}`)
        return
      }

      setColumns(Array.isArray(data.columns) ? data.columns : [])
      setRows(Array.isArray(data.rows) ? data.rows : [])
      setPagination(data.pagination || { page: targetPage, limit: targetLimit, totalRows: 0, totalPages: 1 })
    } finally {
      setLoadingRows(false)
    }
  }, [getDatabaseRows])

  useEffect(() => {
    if (!aToken) return
    loadTables()
  }, [aToken, loadTables])

  useEffect(() => {
    if (!aToken || !selectedTable) return
    loadRows(selectedTable, page, limit)
  }, [aToken, selectedTable, page, limit, loadRows])

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleLimitChange = (event) => {
    const nextLimit = Number(event.target.value)
    setPagination((prev) => ({ ...prev, page: 1, limit: nextLimit }))
  }

  const handlePrev = () => {
    if (page <= 1) return
    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
  }

  const handleNext = () => {
    if (page >= (pagination.totalPages || 1)) return
    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
  }

  return (
    <div className='m-5 w-full'>
      <div className='mb-4 rounded-xl border border-slate-200 bg-white p-4'>
        <h1 className='text-lg font-semibold text-slate-800'>MySQL Data Viewer</h1>
        <p className='mt-1 text-sm text-slate-600'>
          Database: <span className='font-medium'>{database || 'n/a'}</span>
          {serverVersion ? ` | ${serverVersion}` : ''}
        </p>
        {errorMessage && <p className='mt-2 text-sm text-red-600'>{errorMessage}</p>}
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]'>
        <div className='rounded-xl border border-slate-200 bg-white'>
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <h2 className='text-sm font-semibold text-slate-700'>Tables</h2>
            <button
              type='button'
              onClick={loadTables}
              className='rounded-md border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50'
              disabled={loadingTables}
            >
              {loadingTables ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          <div className='max-h-[65vh] overflow-y-auto'>
            {tables.length === 0 && !loadingTables && (
              <div className='px-4 py-6 text-sm text-slate-500'>No tables found</div>
            )}
            {tables.map((table) => (
              <button
                key={table.name}
                type='button'
                onClick={() => handleTableSelect(table.name)}
                className={`flex w-full items-center justify-between border-b px-4 py-3 text-left text-sm ${selectedTable === table.name ? 'bg-[#F2F3FF] text-primary' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <span className='truncate pr-2'>{table.name}</span>
                <span className='rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600'>{table.rowCount ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className='rounded-xl border border-slate-200 bg-white'>
          <div className='flex flex-col gap-3 border-b px-4 py-3 md:flex-row md:items-center md:justify-between'>
            <div>
              <h2 className='text-sm font-semibold text-slate-700'>Table: {selectedTable || 'None selected'}</h2>
              <p className='text-xs text-slate-500'>Rows: {pagination.totalRows ?? 0}</p>
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-xs text-slate-500'>Rows/page</label>
              <select value={limit} onChange={handleLimitChange} className='rounded-md border px-2 py-1 text-sm'>
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <button
                type='button'
                onClick={() => loadRows(selectedTable, page, limit)}
                className='rounded-md border px-3 py-1 text-sm text-slate-700 hover:bg-slate-50'
                disabled={loadingRows || !selectedTable}
              >
                {loadingRows ? 'Loading...' : 'Reload'}
              </button>
            </div>
          </div>

          <div className='max-h-[62vh] overflow-auto'>
            {!selectedTable && (
              <div className='px-4 py-10 text-center text-sm text-slate-500'>Select a table to view data</div>
            )}

            {selectedTable && columns.length === 0 && !loadingRows && (
              <div className='px-4 py-10 text-center text-sm text-slate-500'>No columns available</div>
            )}

            {selectedTable && columns.length > 0 && (
              <table className='min-w-full text-sm'>
                <thead className='sticky top-0 bg-slate-50 text-slate-600'>
                  <tr>
                    {columns.map((column) => (
                      <th key={column} className='border-b px-3 py-2 text-left font-medium'>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={`${selectedTable}-row-${rowIndex}`} className='border-b'>
                      {columns.map((column) => (
                        <td key={`${selectedTable}-${rowIndex}-${column}`} className='max-w-[280px] truncate px-3 py-2' title={formatCell(row[column])}>
                          {formatCell(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rows.length === 0 && !loadingRows && (
                    <tr>
                      <td className='px-3 py-8 text-center text-slate-500' colSpan={columns.length}>No rows on this page</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className='flex items-center justify-between border-t px-4 py-3 text-sm'>
            <span className='text-slate-500'>Page {pagination.page ?? 1} of {pagination.totalPages ?? 1}</span>
            <div className='flex gap-2'>
              <button type='button' onClick={handlePrev} disabled={page <= 1} className='rounded-md border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'>Prev</button>
              <button type='button' onClick={handleNext} disabled={page >= (pagination.totalPages || 1)} className='rounded-md border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'>Next</button>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-4 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500'>
        Showing table data directly from MySQL in read-only mode for admin users.
      </div>
    </div>
  )
}

export default DatabaseViewer
