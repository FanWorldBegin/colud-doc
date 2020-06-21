// 由于要在electron中使用
const fs = window.require('fs').promises
const path = window.require('path')
// 统一管理
const fileHelper = {
	readFile: (path) => {
		// return promise
		return fs.readFile(path, { encoding: 'utf8' })
	},
	writeFile: (path, content) => {
		return fs.writeFile(path, content, { encoding: 'utf8'})
	},
	// 文件重命名
	renameFile: (path, newPath) => {
		return fs.rename(path, newPath)
	},
	deleteFile: (path) => {
		return fs.unlink(path)
	}
}

{
// 	//测试读取
// const testPath = path.join(__dirname, 'hepler.js')
// fileHelper.readFile(testPath).then((data) => {
// 	console.log(data)
// })
// //测试写入
// const testWritePath = path.join(__dirname, 'hello.md')

// fileHelper.writeFile(testWritePath, '### hello ').then(() => {
// 	console.log('写入成功')
// })

// // 测试重命名
// const renamePath = path.join(__dirname, 'rename.md')
// fileHelper.renameFile(testWritePath, renamePath).then(() => {
// 	//resolve
// 	console.log('重命名成功')
// })

// // 测试删除
// fileHelper.deleteFile(renamePath).then(() => {
// 	console.log('删除成功')
// })


}

export default fileHelper