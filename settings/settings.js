const { remote, ipcRenderer } = require('electron')
const Store = require('electron-store')
const settingsStore = new Store({name: 'Settings'})
const qiniuConfigArr = ['#savedFileLocation','#accessKey', '#secretKey', '#bucketName']

const $ = (selector) => {
  const result = document.querySelectorAll(selector)
  return result.length > 1 ? result : result[0]
}

//DOMContentLoaded 和window.load 区别
document.addEventListener('DOMContentLoaded', () => {
  // 拿到之前的位置
  let savedLocation = settingsStore.get('savedFileLocation')
  if (savedLocation) {
    $('#savedFileLocation').value = savedLocation
  }
  // get the saved config data and fill in the inputs
  // 取值部分
  qiniuConfigArr.forEach(selector => {
    // 去掉#
    const savedValue = settingsStore.get(selector.substr(1))
    if (savedValue) {
      $(selector).value = savedValue
    }
  })
  $('#select-new-location').addEventListener('click', () => {
    remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      message: '选择文件的存储路径',
    }).then(result => {
      console.log(result.filePaths)
      if (Array.isArray(result.filePaths)) {
        $('#savedFileLocation').value = result.filePaths[0]
      }
    })
  })

  $('#settings-form').addEventListener('submit', (e) => {
    e.preventDefault()
    qiniuConfigArr.forEach(selector => {
      if ($(selector)) {
        let { id, value } = $(selector)
        settingsStore.set(id, value ? value : '')
      }
    })

    // sent a event back to main process to enable menu items if qiniu is configed
    ipcRenderer.send('config-is-saved')
    remote.getCurrentWindow().close()

    // settingsStore.set('saveFileLocation', savedLocation)
    // remote.getCurrentWindow().close()
  })

  $('.nav-tabs').addEventListener('click', (e) => {
    // 阻止a链接跳转
    e.preventDefault()
    $('.nav-link').forEach(element => {
      // 删除一个className
      element.classList.remove('active')
    })

    e.target.classList.add('active')
    $('.config-area').forEach(element => {
      element.style.display = 'none'
    })
    // 添加了自定义属性
    $(e.target.dataset.tab).style.display = 'block'
  })
})