// 处理菜单事件
import {useEffect} from 'react';

//在渲染进程上面访问主进程内容
const {ipcRenderer } = window.require('electron')

// const obj = {
// 	'create-file': () => {},
// }
const useIpcRenderer = (keyCallBackMap) => {
	console.log('keyCallBackMap', keyCallBackMap)
	useEffect(() => {
		Object.keys(keyCallBackMap).forEach(key => {
			ipcRenderer.on(key, keyCallBackMap[key])
		})
		// 清除回调
		return () => {
			Object.keys(keyCallBackMap).forEach(key => {
				ipcRenderer.removeListener(key, keyCallBackMap[key])
			})
		}
	})

}

export default useIpcRenderer