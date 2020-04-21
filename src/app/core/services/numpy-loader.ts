export class NumpyLoader {
   private static asciiDecode(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  private static readUint16LE(buffer) {
    const view = new DataView(buffer);
    let val = view.getUint8(0);
    val |= view.getUint8(1) << 8;
    return val;
  }

  static fromArrayBuffer(buf) {
    // Check the magic number
    const magic = this.asciiDecode(buf.slice(0, 6));
    if (magic.slice(1,6) != 'NUMPY') {
      throw new Error('unknown file type');
    }

    const version = new Uint8Array(buf.slice(6, 8));
    let headerLength = NumpyLoader.readUint16LE(buf.slice(8, 10));
    let headerStr = this.asciiDecode(buf.slice(10, 10 + headerLength));
    let offsetBytes = 10 + headerLength;
    //rest = buf.slice(10+headerLength);  XXX -- This makes a copy!!! https://www.khronos.org/registry/typedarray/specs/latest/#5

    // Hacky conversion of dict literal string to JS Object
    let info;
    eval("info = " + headerStr.toLowerCase().replace('(','[').replace('),',']'));

    // Interpret the bytes according to the specified dtype
    let  data;
    if (info.descr === "|u1") {
      data = new Uint8Array(buf, offsetBytes);
    } else if (info.descr === "|i1") {
      data = new Int8Array(buf, offsetBytes);
    } else if (info.descr === "<u2") {
      data = new Uint16Array(buf, offsetBytes);
    } else if (info.descr === "<i2") {
      data = new Int16Array(buf, offsetBytes);
    } else if (info.descr === "<u4") {
      data = new Uint32Array(buf, offsetBytes);
    } else if (info.descr === "<i4") {
      data = new Int32Array(buf, offsetBytes);
    } else if (info.descr === "<f4") {
      data = new Float32Array(buf, offsetBytes);
    } else if (info.descr === "<f8") {
      data = new Float64Array(buf, offsetBytes);
    } else {
      throw new Error('unknown numeric dtype')
    }

    return {
      shape: info.shape,
      fortran_order: info.fortran_order,
      data: data
    };
  }
}
