/* Minimal PNG writer. Node's zlib is all it needs — a preview you can actually
   look at is the whole point of this workflow, and it must not depend on
   anything being installed. */
import zlib from 'node:zlib';

const CRC = (() => {
  const t = new Int32Array(256);
  for(let n = 0; n < 256; n++){
    let c = n;
    for(let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf){
  let c = -1;
  for(const b of buf) c = CRC[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data){
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** rgba: Uint8Array of w*h*4 */
export function encodePNG(w, h, rgba){
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for(let y = 0; y < h; y++){
    raw[y * (w * 4 + 1)] = 0;                       // filter: none
    rgba.subarray ? raw.set(rgba.subarray(y*w*4, (y+1)*w*4), y*(w*4+1)+1)
                  : raw.set(rgba.slice(y*w*4, (y+1)*w*4), y*(w*4+1)+1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
