export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function downloadFileFromUrl(url: string, fileName?: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName || ''
  console.log(link.download)
  link.click()
}

export function downloadFileFromBlob(blob: Blob, fileName?: string) {
  console.log(blob)
  const link = document.createElement('a')
  console.log(link)
  link.href = URL.createObjectURL(blob)
  console.log(link.href)
  link.download = fileName || ''
  console.log(link.download)
  link.click()
}

export function blobToUrl(blob: Blob) {
  return URL.createObjectURL(blob)
}
