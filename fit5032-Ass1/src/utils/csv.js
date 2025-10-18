export function downloadCSV(filename, rows) {
    if (!rows || !rows.length) return
    const esc = (v) => {
        const s = String(v ?? '')
        //If it contains commas, newlines, or quotes, wrap it in quotes and escape the inner quotes.
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const header = Object.keys(rows[0])
    const csv = [
        header.map(esc).join(','),
        ...rows.map(r => header.map(h => esc(r[h])).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
