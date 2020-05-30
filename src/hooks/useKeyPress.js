import React, { useState, useEffect } from 'react'

const useKeyPress = (targetKeyCode) => {
	const [keyPressed, setKeyPressed ] = useState(false)
	// 按下事件 绑定键盘按下事件
	const keyDownHandler = ({ keyCode }) => {
		if(keyCode == targetKeyCode) {
			setKeyPressed(true)
		}
	}
	// 抬起事件
	const keyUpHandler = ({keyCode}) => {
		if(keyCode == targetKeyCode) {
			setKeyPressed(false)
		}
	}

	useEffect(() => {
		document.addEventListener('keydown', keyDownHandler)
		document.addEventListener('keyup', keyUpHandler)
		return () => {
			document.removeEventListener('keydown', keyDownHandler)
			document.removeEventListener('keyup', keyUpHandler)
		}
	}, [])
	return keyPressed
}

export default useKeyPress