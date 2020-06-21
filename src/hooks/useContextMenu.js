import { useEffect, useRef } from 'react'
//load nodejs module
const { remote } = window.require('electron')
const { Menu, MenuItem} = remote;

const useContextMenu = (itemArr, targetSelectort, deps) => {
	// 在多次渲染保持引用
	let clickedElement = useRef(null)

	useEffect(() => {
		const menu = new Menu()
		itemArr.forEach(item => {
			menu.append(new MenuItem(item))
		})

		const handleContextMenu = (e) => {
			// 获取点击哪个元素
			clickedElement.current = e.target
			// only show the context menu on current element or targetSelector contains target
			// 1.拿到dom元素
			if(document.querySelector(targetSelectort).contains(e.target)) {
				console.log('弹出')
				menu.popup({window: remote.getCurrentWindow()}) 
			}
	
		}
		// contextmenu 事件会在用户尝试打开上下文菜单时被触发。
		//该事件通常在鼠标点击右键或者按下键盘上的菜单键时被触发
		window.addEventListener('contextmenu', handleContextMenu)

		return () => {
			window.removeEventListener('contextmenu', handleContextMenu)
		}
	}, deps) // 不放空数组就每次都更新

	return  clickedElement;
	 // 返回点击元素
}


export default useContextMenu