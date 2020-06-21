// https://developer.qiniu.com/kodo/sdk/1289/nodejs
// 完整的上传下载操作
const qiniu = require('qiniu')
// generate mac
var accessKey = 'RcvyDaAWZjhbhl_XNsRWEKqA9dQeIY6TPz-jk4X0';
var secretKey = 'VTkuuxR-nzSsYLuPNgB5PP5kjhmODNcIcGRMQCQR';
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

// generate upload token
var options = {
  scope: 'clouddocl', //新建的储存空间名称
};
var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken=putPolicy.uploadToken(mac);

//服务端直传 init config class

var config = new qiniu.conf.Config();
// 空间对应的机房
config.zone = qiniu.zone.Zone_z0;
// 是否使用https域名
//config.useHttpsDomain = true;
// 上传是否使用cdn加速
//config.useCdnDomain = true;


var localFile = "/Users/wangyu/Documents/2.md.md";
var formUploader = new qiniu.form_up.FormUploader(config);
var putExtra = new qiniu.form_up.PutExtra();
var key='2.md';
// // 文件上传
// formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
//   respBody, respInfo) {
//   if (respErr) {
//     throw respErr;
//   }
//   if (respInfo.statusCode == 200) {
//     console.log(respBody);
//   } else {
//     console.log(respInfo.statusCode);
//     console.log(respBody);
//   }
// });

// node test.js
// 公开空间访问链接-- 下载
var bucketManager = new qiniu.rs.BucketManager(mac, config);
var publicBucketDomain = 'http://qbwvex6nh.bkt.clouddn.com';
var publicDownloadUrl = bucketManager.publicDownloadUrl(publicBucketDomain, key);
console.log(publicDownloadUrl);