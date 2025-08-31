export const sha256 = (s) => {
  // Lightweight hashing for demonstration purposes (not production encryption)
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0
  return ('00000000' + h.toString(16)).slice(-8)
}
