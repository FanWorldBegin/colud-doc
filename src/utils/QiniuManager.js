// 将上传下载函数包装为类
const qiniu = require('qiniu')
const axios = require('axios')
const fs = require('fs')
class QiniuManager {
	constructor(accessKey, secretKey, bucket) {
		// 加到实例属性上去
		this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
		this.bucket = bucket
		
		//服务端直传 init config class
		this.config = new qiniu.conf.Config();
		// 空间对应的机房
		this.config.zone = qiniu.zone.Zone_z0;

		this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
	}

	uploadFile(key, localFilePath) {
		// generate upload token
		var options = {
			scope: this.bucket + ':' + key,  //冒号和key是进行覆盖上传
			//新建的储存空间名称
		};
		var putPolicy = new qiniu.rs.PutPolicy(options);
		var uploadToken=putPolicy.uploadToken(this.mac);
		var formUploader = new qiniu.form_up.FormUploader(this.config);
		var putExtra = new qiniu.form_up.PutExtra();

		// 文件上传
		return new Promise((resolve, reject) => {
			formUploader.putFile(uploadToken, key, localFilePath, putExtra, function(respErr,
				respBody, respInfo) {
				if (respErr) {
					throw respErr;
				}
				if (respInfo.statusCode == 200) {
					resolve(respBody)

				} else {
					reject({
						statusCode: respInfo.statusCode,
						body: respBody
					})
				}
			});
		})
	}
	// key 为名称
	deleteFile(key) {
		return new Promise((resolve, reject) => {
			this.bucketManager.delete(this.bucket, key, this._handleCallBack(resolve, reject))
		})
	}
	// 使用高阶函数，返回一个接受两个参数的函数
	_handleCallBack(resolve, reject) {
		return (respErr, respBody, respInfo) => {
			if (respErr) {
				throw respErr;
			}
			if (respInfo.statusCode == 200) {
				resolve(respBody)
	
			} else {
				reject({
					statusCode: respInfo.statusCode,
					body: respBody
				})
			}
		}
	}

	getBucketDomain() {
		const requestURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`
		const digest = qiniu.util.generateAccessToken(this.mac, requestURL)
		return new Promise((resolve,reject) => {
			// 发送请求的
			qiniu.rpc.postWithoutForm(requestURL, digest, this._handleCallBack(resolve, reject))
		})

	}

	generateDownloadLink(key) {
		// 判断是否已经有publicBacketDomain
		const domainPromise = this.publicBacketDomain ? 
			Promise.resolve([this.publicBacketDomain]) :
			this.getBucketDomain()
			return domainPromise.then(data => {
				// 域名30天有效期
				if(Array.isArray(data) && data.length > 0) {
					// 判断是否有协议头
					const pattern = /^https?/
					this.publicBacketDomain = pattern.test(data[0]) ? data[0] : `http://${data[0]}`
					// 返回要下载地址
					return this.bucketManager.publicDownloadUrl(this.publicBacketDomain, key)
				} else {
					throw Error('域名未找到，请查看存储空间是否已过期')
				}
			})
	}

	downloadFile(key, downloadPath) {
		// step1 get the downLink
		// step2 send the request to download link, return a readable stream
		// step3 create a writable stream and pipe to it
		// step4 return a promise based result
		return this.generateDownloadLink(key).then(link => {
			//加时间戳
			const timeStamp = new Date().getTime()
			const url = `${link}?timeStamp=${timeStamp}`
			return axios({
				url,
				method: 'GET',
				responseType: 'stream',
				headers: {'Cache-Control': 'no-catche'}
			})
		}).then(response => {
			const writter = fs.createWriteStream(downloadPath)
			response.data.pipe(writter)
			// 返回promise
			return new Promise((resolve, reject) => {
				writter.on('finish', resolve)
				writter.on('error', reject)
			})
		}).catch(err => {
			// 如果请求错误
			return Promise.reject({ err: err.response })
		})
	}
	// 	下载文件
	getStat(key) {
		return new Promise((resolve, reject) => {
			this.bucketManager.stat(this.bucket, key, this._handleCallBack(resolve, reject))
		})
	}
}

module.exports = QiniuManager