import React from 'react'
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useKeyPress from '../hooks/useKeyPress'

const BottomBtn = ({ text, colorClass, icon, onBtnClick }) => {

	return (
		<span 
			className={`btn btn-block no-border ${colorClass}`}
			onClick={onBtnClick}
			>
				<FontAwesomeIcon icon={icon}  title="删除"  size="lg" className="mr-2" />
				{text}
			</span>
	)
}

BottomBtn.prototype = {
	text: PropTypes.string,
	colorClass: PropTypes.string,
	// 你可以通过 PropTypes.element 来确保传递给组件的 children 中只包含一个元素。 
	icon: PropTypes.element.isRequired,
	onBtnClick: PropTypes.func,

}

BottomBtn.defaultProps = {
	text: '新建'
}
export default BottomBtn