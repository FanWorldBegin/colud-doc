import React, { useState , useEffect, useRef} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types';

const FileSearch = ( { title, onFileSearch }) => {
	const [inputActive, setInputActive ] = useState(false);
	const [value, setValue ] = useState(' ')

	let node = useRef(null);

	const closeSearch = (e) => {
		e.preventDefault()
		setInputActive(false)
		setValue('')
	}
	//添加副作用--键盘事件
	useEffect(() => {
		const handleInputEvent = (event) => {
			const { keyCode } = event
			// 13 enter 27 esc
			if(keyCode == 13 && inputActive) {
				onFileSearch(value)
			} else if(keyCode == 27 && inputActive) {
				closeSearch(event)
			}
		} 
		// 在按键时候添加事件绑定
		document.addEventListener('keyup', handleInputEvent)

		return () => {
			// 注意销毁事件
			document.removeEventListener('keyup', handleInputEvent)
		}
	})

	useEffect(() => {
		if(inputActive) {
			node.current.focus()
		}
	}, [inputActive]) // 只有当inputActive 改变时候才聚焦


	return (
		<div className="alert alert-primary" role="alert">
			{ !inputActive && 
				<div className="d-flex justify-content-between align-items-center">
					<span>{title}</span>
					<button type="button" 
						className="icon-button"
						onClick={() => {setInputActive(true)}}
					>
						 <FontAwesomeIcon icon={faSearch}  size="lg" title="搜索" />
					</button>
				</div>
			}
			{ inputActive &&
				<div className="d-flex justify-content-between align-items-center">
					<input
						className="form-control" 
						value={value}
						onChange={(e) =>{ setValue(e.target.value)}}
						ref={node}
					></input>
					<button
						type="button"
						className="icon-button"
						onClick={closeSearch}
					  // 可以通过node.current 获取节点
					>

						<FontAwesomeIcon icon={faTimes}  title="关闭"  size="lg"/>
					</button>
				</div>
			}
		</div>
	)
}

FileSearch.prototypes = {
	title: PropTypes.string,
	onFileSearch:PropTypes.func.isRequired
}

FileSearch.defaultProps = {
	title: '我的云文档'
}
export default FileSearch