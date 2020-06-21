const fs = require('fs')
const zlib = require('zlib')
// 建立可读流
const src = fs.createReadStream('./test.js')
const writeDesc = fs.createWriteStream('./test.writestream.js')
// 创建可写流，将可读流放入可写流
//src.pipe(process.stdout)  => 直接输出
// node testStream.js 

// src.pipe(writeDesc)

// 生成压缩包使用转换流
const writeDescZip = fs.createWriteStream('./test.writeDescZip.gz')
src.pipe(zlib.createGzip()).pipe(writeDescZip)
