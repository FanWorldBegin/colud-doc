// https://developer.qiniu.com/kodo/sdk/1289/nodejs
// 完整的上传下载操作
const qiniu = require('qiniu')
const QiniuManager = require('./src/utils/QiniuManager')
// generate mac
var accessKey = 'RcvyDaAWZjhbhl_XNsRWEKqA9dQeIY6TPz-jk4X0';
var secretKey = 'VTkuuxR-nzSsYLuPNgB5PP5kjhmODNcIcGRMQCQR';
var localFile = "/Users/wangyu/Documents/2.md.md";
var key='rename.md';
var publicBucketDomain = 'http://qbwvex6nh.bkt.clouddn.com';

const manager = new QiniuManager(accessKey, secretKey, 'clouddocl');

const path = require('path')
const downloadPath = path.join(__dirname, key)

// manager.uploadFile(key, localFile).then(data => {

// 	console.log('上传成功', data)
// 	return manager.deleteFile(key)
// }).then((data) => {
// 	// reject
// 	console.log('删除成功', data)
// })
manager.getBucketDomain().then(data => {
	// 获取publicBucketDomain
	console.log(data) // [ 'qbwvex6nh.bkt.clouddn.com' ]
})

//获取下载地址
manager.generateDownloadLink(key).then(data => {
	console.log('下载地址', data)
	return manager.generateDownloadLink('first.md')
}).then(data => {
	console.log('第二次请求', data)
})
//manager.deleteFile(key, localFile)

manager.downloadFile(key, downloadPath).then((data) => {
	console.log('下载写入完毕')
})
.catch(err => {
	console.log(err)
})