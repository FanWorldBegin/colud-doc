// flatten 结构编码
export const flattenArr = (arr) => {
	// reduce 归并，相加，（上次获得的值，下一个元素
	return arr.reduce((map, item) => {
		map[item.id] = item
		return map
	}, {} )// 初始值
}
/** 
{
	1: {id: "1", title: "first post", body: "should be aware of this", createdAt: 123445453454353}
	2: {id: "2", title: "second post", body: "## should be aware of this", createdAt: 123445453454353}
}

*/

// 转为数组
export const objToArr = (obj) => {
	return Object.keys(obj).map(key => obj[key])
}
/**
 [
	1: {id: "1", title: "first post", body: "should be aware of this", createdAt: 123445453454353}
	2: {id: "2", title: "second post", body: "## should be aware of this", createdAt: 123445453454353}
	]
 */


export const getParentNode = (node, parentClassName) => {
	let current = node
  
	while(current !== null) {
		// 判断一个节点是否有class classList
		if(current.classList.contains(parentClassName)) {
			return current
		}
		// 拿到父节点
		current = current.parentNode
	}

	return false // 都没有
}

export const timeStampToString = (timeStamp => {
	const date = new Date()
	return date.toLocaleDateString() + date.toLocaleTimeString()
})
