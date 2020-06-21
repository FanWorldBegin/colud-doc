import React, { useState , useEffect, useRef} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types';
import useKeyPress from '../hooks/useKeyPress'
import useContextMenu from '../hooks/useContextMenu'
import{ getParentNode } from '../utils/hepler'
//load nodejs module
const { remote } = window.require('electron')
const { Menu, MenuItem} = remote;

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
	const [editStatus, setEditStatus] = useState(false) // 点击编辑按钮 记录是那一条数据
	const [value, setValue] = useState('')
	// 按键事件
	const enterPressed = useKeyPress(13)
	const escPressed = useKeyPress(27)

	const closeSearch = (editItem) => {
		setEditStatus(false)
		setValue('')
		//if we are editing a newly file, we should delete this file
		if(editItem.isNew) {
			// 新建时候点击叉关闭
			onFileDelete(editItem.id)
		}
	}

	//添加副作用--键盘事件
	// useEffect(() => {
	// 	const handleInputEvent = (event) => {
	// 		const { keyCode } = event
	// 		// 13 enter 27 esc
	// 		if(keyCode == 13 && editStatus) {
	// 			const editItem = files.find(file => file.id == editStatus)

	// 			onSaveEdit(editItem.id, value)
	// 			setEditStatus(false)
	// 			setValue('')
	// 		} else if(keyCode == 27 && editStatus) {
	// 			closeSearch(event)
	// 		}
	// 	} 
	// 	// 在按键时候添加事件绑定
	// 	document.addEventListener('keyup', handleInputEvent)

	// 	return () => {
	// 		// 注意销毁事件
	// 		document.removeEventListener('keyup', handleInputEvent)
	// 	}
	// })

	useEffect(() => {
		const editItem = files.find(file => file.id == editStatus)
		// 按下回车键保存
		if(enterPressed && editStatus && value.trim() !== '') {
			console.log('保存文件')
			// 找到这条数据
			onSaveEdit(editItem.id, value, editItem.isNew)
			setEditStatus(false)
			setValue('')
		}

		if(escPressed && editStatus) {
			closeSearch(editItem)
		}
	})

	// 每新建文件
	useEffect(() => {
		const newFile = files.find(file => file.isNew)
		console.log('新建文件保存Effect')
		if(newFile) {
			setEditStatus(newFile.id)
			setValue(newFile.title)
		}
	}, [files])

	// 添加上下文菜单
	const clickItem =  useContextMenu([
		{
			label: '打开',
			click: () => {
				// 回调函数
				const parentElement = getParentNode(clickItem.current, 'file-item')
				// parentElement.dataset.id
				if(parentElement) {
					onFileClick(parentElement.dataset.id)
				}
			}
		},
		{
			label: '重命名',
			click: () => {
				// 回调函数
				const parentElement = getParentNode(clickItem.current, 'file-item');
				if(parentElement) {
					setEditStatus(parentElement.dataset.id); 
					setValue(parentElement.dataset.title)
				}
			}
		},
		{
			label: '删除',
			click: () => {
				// 回调函数
				const parentElement = getParentNode(clickItem.current, 'file-item');
				if(parentElement) {
					onFileDelete(parentElement.dataset.id)
				}
			}
		}
	], '.file-list', [files])

	useEffect(() => {
		// const menu = new Menu();
		// menu.append(new MenuItem({
		// 	label: '打开',
		// 	click: () => {
		// 		// 回调函数
		// 		console.log('打开')
		// 	}
		// }))
		// menu.append(new MenuItem({
		// 	label: '重命名',
		// 	click: () => {
		// 		// 回调函数
		// 		console.log('renaming')
		// 	}
		// }))
		// menu.append(new MenuItem({
		// 	label: '删除',
		// 	click: () => {
		// 		// 回调函数
		// 		console.log('deleting')
		// 	}
		// }))

		// const handleContextMenu = (e) => {
		// 	menu.popup({window: remote.getCurrentWindow()})
		// }
		// // contextmenu 事件会在用户尝试打开上下文菜单时被触发。
		// //该事件通常在鼠标点击右键或者按下键盘上的菜单键时被触发
		// window.addEventListener('contextmenu', handleContextMenu)

		// return () => {
		// 	window.removeEventListener('contextmenu', handleContextMenu)
		// }
	})
	return (
		<ul className='list-group list-group-flush file-list'>
		{
			files.map(file => (
				<li className="list-group-item bg-light d-flex align-items-center file-item row mx-0" 
				key={file.id}
				// 通过dom传递信息
				data-id={file.id}
				data-title={file.title}
				>
				{ (file.id !== editStatus && !file.isNew) &&  //展示普通界面
					<>
						<span className='col-2'><FontAwesomeIcon icon={faMarkdown}  title="MarkDown"  size="lg"/></span>
						<span className="col-6 c-link" onClick={()=> {onFileClick(file.id)}}>{file.title}</span>
						
						{/* 点击编辑设置当前编辑ID，设置value为当前的title值 */}
						{/* <button className='col-2 icon-button' type="button"
							onClick={()=> {setEditStatus(file.id); setValue(file.title)}}
						>
							<FontAwesomeIcon icon={faEdit}  title="编辑"  size="lg"/>
						</button>

						<span className='col-2' onClick={()=> {onFileDelete(file.id)}}>
							<FontAwesomeIcon icon={faTrash}  title="删除"  size="lg"/>
						</span> */}
					</>
				}
				{
					//  展示编辑框
					(file.id == editStatus || file.isNew) && 
					<>
					<input
						className="form-control col-10"
						value={value}
						placeholder='请输入文件名称'
						onChange={(e) =>{ setValue(e.target.value)}}
					></input>
					<button
						type="button"
						className="icon-button col-2"
						onClick={() => {closeSearch(file)}}
					  // 可以通过node.current 获取节点
					>

						<FontAwesomeIcon icon={faTimes}  title="关闭"  size="lg"/>
					</button>
				</>
				}
				</li>
			))
		}
		</ul>
	)
}
FileList.propTypes = {
	files: PropTypes.array,
	onFileClick: PropTypes.func,
	onFileDelete: PropTypes.func,
	onSaveEdit: PropTypes.func,
}
export default FileList