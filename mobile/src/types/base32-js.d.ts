declare module 'base32.js' {
  const base32: {
    decode: (input: string) => Uint8Array
    encode: (input: Uint8Array) => string
  }
  export default base32
}