// src/utils/cryptoToy.js
function djb2(str){let h=5381;for(let i=0;i<str.length;i++)h=((h<<5)+h)^str.charCodeAt(i);return (h>>>0)||1;}
function xorshift32(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
function toB64Url(u8){let s="";for(let i=0;i<u8.length;i++)s+=String.fromCharCode(u8[i]);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
function fromB64Url(b){b=b.replace(/-/g,"+").replace(/_/g,"/");const pad=b.length%4? "=".repeat(4-(b.length%4)):"";const bin=atob(b+pad);const out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;}
export function encryptToy(password, key){
  const pw=new TextEncoder().encode(password);
  const next=xorshift32(djb2(String(key)));
  const out=new Uint8Array(pw.length);
  for(let i=0;i<pw.length;i++) out[i]=pw[i] ^ (next() & 0xff);
  return toB64Url(out);
}
export function decryptToy(cipherB64, key){
  const data=fromB64Url(cipherB64); const next=xorshift32(djb2(String(key))); const out=new Uint8Array(data.length);
  for(let i=0;i<data.length;i++) out[i]=data[i] ^ (next() & 0xff);
  return new TextDecoder().decode(out);
}
