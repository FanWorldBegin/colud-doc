const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const isDev = require('electron-is-dev')
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
const path = require('path')
const Store = require('electron-store')
const QiniuManager = require('./src/utils/QiniuManager')
const settingsStore = new Store({name: 'Settings'})
const fileStore = new Store({name: 'files Data'})
// 例实例化
const createManager = () => {
	const accessKey = settingsStore.get('accessKey')
	const secretKey = settingsStore.get('secretKey')
	const bucketName = settingsStore.get('bucketName')

	return new QiniuManager(accessKey, secretKey, bucketName)
}
let mainWindow, settingsWindow;
app.on('ready', () => {

	const mainWindowConfig = {
		width: 1440,
		height: 780,
	}
	const urlLocation = isDev ? 'http://localhost:3000' : 'dummyurl'
	
	mainWindow = new AppWindow(mainWindowConfig, urlLocation)
	// 关闭回收
	mainWindow.on('closed', () => {
		mainWindow = null
	})

	// //hook up main events
	// // 接收到事件
	ipcMain.on('open-settings-window', () => {
		// 设置窗口
		const settingsWindowConfig = {
			width: 500,
			height: 400,
			parent: mainWindow
		}

		const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
		settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)

			// 关闭回收
			settingsWindow.on('closed', () => {
			settingsWindow = null
		})

	})

	ipcMain.on('upload-file', (event, data) => {
		const manager = createManager()
		manager.uploadFile(data.key, data.path).then(data => {
			console.log('上传成功', data)
			mainWindow.webContents.send('active-file-uploaded')

		}).catch(() => {
			dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
		})
	})
	//set the menu
	let menu = Menu.buildFromTemplate(menuTemplate)
	Menu.setApplicationMenu(menu)

	// 配置更新后，云同步部分菜单是否可用
	ipcMain.on('config-is-saved', () => {
		console.log('config-is-saved')
		// watch out menu items index for mac and windows 云同步部分
		let qiniuMenu = process.platform == 'darwin' ? menu.items[3] : menu.items[2]
		// qiniuMenu.submenu.items[1].enabled = true

		const switchItems = (toggle) => {
			[1, 2, 3].forEach(number => {
				qiniuMenu.submenu.items[number].enabled = toggle
			})
		}
		const qiniuIsConfiged =  ['accessKey', 'secretKey', 'bucketName'].every(key => !!settingsStore.get(key))
		if(qiniuIsConfiged) {
			switchItems(true)
		} else {
			switchItems(false)
		}
	})
	// 从云端下载file
	ipcMain.on('download-file', (event, data) => {
		const manager = createManager()
		const filesObj = fileStore.get('files')
		// 11-8
		const { key, path, id } = data

		// 11-7
		manager.getStat(data.key).then(resp => {
			//成功回调
			// console.log('resp', filesObj)
			// console.log(filesObj[data.id])
			// 11-8
			const serverUpdatedTime = Math.round(resp.putTime / 10000)
			const localUpdatedTime = filesObj[id].updatedAt
			console.log('serverUpdatedTime', serverUpdatedTime)
			console.log('localUpdatedTime', localUpdatedTime)
			// 不存在, 或云时间大于本地更新时间
			if(serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
				manager.downloadFile(key, path).then(() => {
					mainWindow.webContents.send('file-downloaded', {status: 'download-success', id})
				})
			}else {
				mainWindow.webContents.send('file-downloaded', {status: 'no-new-file', id})
			}
		}, error => {
			//失败回调 -- 没有这个文件
			console.log(error)
			if(error.statusCode == 612) {
				mainWindow.webContents.send('file-downloaded', {status: 'nofile'}, id)
			}
		})
	})
	// 全部上传
	ipcMain.on('upload-all-to-qiniu', () => {
		mainWindow.webContents.send('loading-status', true)
		// 伪请求
		setTimeout(() => {
			mainWindow.webContents.send('loading-status', false)
		}, 2000)
	})
})