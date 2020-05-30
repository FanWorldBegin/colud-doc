import React, { useState , useEffect, useRef} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import './TabList.scss'
const TabList = ({ files, activeId, unsaveIds, onTabClick, onCloseTab }) => {

	return (
		<ul className='nav nav-pills tablist-component'>
		{
			files.map(file => {
				// 未保存红点
				const withUnsavedMark = unsaveIds.includes(file.id)
				const fClassName = classNames({
					'nav-link': true, //永远都有
					"active": file.id == activeId,
					'withUnsaved': withUnsavedMark
				});
				return (
					<li className="nav-item" key={file.id}>
						<a className={fClassName} href="#"
							onClick={e => {e.preventDefault(); onTabClick(file.id)}}>
							{ file.title }
							<span className='ml-2 close-icon'
										// 防止冒泡
								onClick={(e) => {e.stopPropagation(); onCloseTab(file.id)}}>  
								<FontAwesomeIcon icon={faTimes}/>
							</span>
							{ withUnsavedMark && <span className="rounded-circle unsaved-icon ml-2"></span>}
						</a>
					</li>
				)
			})
		}
		</ul>
	)
}
TabList.prototype = {
	files: PropTypes.array,
	activeId: PropTypes.string,
	unsaveIds: PropTypes.array,
	onTabClick: PropTypes.func,
	onCLoseTab: PropTypes.func
}

TabList.defaultProps = {
	unsaveIds: []
}
export default TabList