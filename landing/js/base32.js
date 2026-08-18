window.Base32 = {
  decode(input) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const cleaned = input.replace(/[\s=-]/g, '').toUpperCase();
    let bits = '';
    for (const c of cleaned) {
      const val = alphabet.indexOf(c);
      if (val === -1) throw new Error('Invalid base32 character: ' + c);
      bits += val.toString(2).padStart(5, '0');
    }
    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
    }
    return bytes;
  },
  encode(input) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
    let bits = '';
    for (const b of bytes) bits += b.toString(2).padStart(8, '0');
    while (bits.length % 5 !== 0) bits += '0';
    let result = '';
    for (let i = 0; i < bits.length; i += 5) {
      result += alphabet[parseInt(bits.substr(i, 5), 2)];
    }
    return result;
  }
};
