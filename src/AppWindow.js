const { BrowserWindow } = require('electron')

class AppWindow extends BrowserWindow {
	constructor(config, urlLocation) {
		const basicConfig = {
			width: 1024,
			height: 680,
			webPreferences: {
				nodeIntegration: true, //在renderProcress里面使用node
				//webSecurity: false
			},
			// 优雅展示窗口
			show: false,
			backgroundColor: '#efefef'
		}

		const finalConfig = { ...basicConfig, ...config}
		super(finalConfig)

		this.loadURL(urlLocation)
		this.once('ready-to-show', () => {
			this.show()
		})
	}
}

module.exports = AppWindow