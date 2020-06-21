import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css"
import FileSearch from './components/FileSearch'
import defaultFiles from './utils/defaultFiles'
import FileList from './components/FileList'
import TabList from './components/TabList'
import BottomBtn from './components/BottomBtn'
import { faPlus, faFileImport, faSave } from '@fortawesome/free-solid-svg-icons'
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { v4 as uuidv4 } from 'uuid';
import {flattenArr, objToArr, timeStampToString} from './utils/hepler'
import fileHelper from './utils/fileHelper'
import useIpcRenderer from './hooks/useIpcRenderer';
import  Loader from './components/Loder'
const fs = window.require('fs')
// require nodejs modules
const { join, basename, extname, dirname } = window.require('path')
//在渲染进程上面访问主进程内容
const { remote, ipcRenderer } = window.require('electron')
console.log(fs)
const Store = window.require('electron-store')
// 实例化 传递Object
const fileStore = new Store({'name': 'files Data'})
const settingsStore = new Store({name: 'Settings'})

// 动态修改菜单
//enableAutoSync 是否开始自动同步
const getAutoSync = () => ['accessKey', 'secretKey', 'bucketName', 'enableAutoSync'].every(key => !!settingsStore.get(key))

const saveFilestoStore = (files) => {
  // we don't have to dtore all info in file system, eg: isNew body
  const filesSroreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt, isSynced, updatedAt } = file
    result[id] = {
      id,
      path,
      title,
      createdAt,
      isSynced,
      updatedAt,
    }
    return result
  }, {})
  fileStore.set('files', filesSroreObj)
}

function App() {
  const [files, setFiles ] = useState(fileStore.get('files') || {})
  // console.log('files', files)
  const [ activeFileID, setActiveFileID ] = useState('')
  const [ openedFileIDs, setOpenedFileIDs ] = useState([])
  const [ unsavedFileIDs, setUnsavedFileIDs ] = useState([])
  const [searchedFiles, setSearchedFiles] = useState([])
  const [isLoading, setLoading ] = useState(false)
  // 拿到我的文档目录地址 Directory for a user's "My Documents".
  // const savedLocation = remote.app.getPath('documents')
  const savedLocation = settingsStore.get('savedFileLocation') || remote.app.getPath('documents');
  // 数组类型的
  const filesArr = objToArr(files);
  // console.log('filesArray', filesArr)
  // 获取当前激活File
  const activeFile = files[activeFileID] // 获取开启的tab信息
  const openedFiles = openedFileIDs.map( openID => {
    return files[openID]
  }) // 获取开启的tab信息

  const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArr;
  // 添加处理数据的方法
  //1.点击list右侧出现tab
  const fileClick = (fileID) => {
    // set current active file
    setActiveFileID(fileID);
    // 点击读取body
    const currFile = files[fileID]
    const { id, title, path, isLoaded } = currFile;


    if(!currFile.isLoaded) {
      // 如果开启了自动更新
      if(getAutoSync()) {
        ipcRenderer.send('download-file', { key: `${title}.md`, path, id})
      } else {
        //没读取过
        fileHelper.readFile(currFile.path).then(value => {
          const newFile = {...files[fileID], body: value, isLoaded: true}
          // 更新file
          setFiles({ ...files, [fileID]: newFile})
        })
      }
    }
    
    // if openedFiles don't have the current ID
    if(!openedFileIDs.includes(fileID)) {
      // add new fileID to openedFiles
      setOpenedFileIDs([...openedFileIDs, fileID])
    }
  }
  //2.set active fileID 点击tab设置高亮
  const tabClick = (fileID) => {
    setActiveFileID(fileID)
  }

  //3.删除操作  penedFileIDs 删去当前 id，设置一个默认高亮
  const tabClose = (id) => {
    // 筛选
    const tabsWithout = openedFileIDs.filter(fileID => fileID !== id);
    setOpenedFileIDs(tabsWithout)
    // set the active tp the first opened tab if  tabs still left
    if(tabsWithout.length > 0) {
      setActiveFileID(tabsWithout[0])
    } else {
      setActiveFileID('')
    }

  }
  //4.SimpleMDE onChange a.设置小红点 b.更新files 中的body
  const fileChange = (id, value) =>{
    // 有变化调用否则当使用快捷键时候也会触发
    if(value !== files[id].body) {
      //newFile 不能直接在state上修改，要生成新的对象
      const newFile ={...files[id], body:value}

      // 设置新的file
      setFiles({...files, [id]: newFile})
      // update unsavedIDs
      if(!unsavedFileIDs.includes(id)) {
        setUnsavedFileIDs([...unsavedFileIDs, id])
      }
    }
  }

  //5.侧边栏删除
  const deleteFile = (id) => {
    if(files[id].isNew) {
      const { [id]: value, ...afterDelete } = files
      // afterDeletec 除了id外所有项
      // 未保存的文件
      // delete files[id]
      setFiles(afterDelete)
    } else {
      //已经保存的文件
      // filter out the current file id
      fileHelper.deleteFile(files[id].path).then(() => {
        delete files[id]
        setFiles({ ...files})
        saveFilestoStore(files)
        // close the tab if  opened
        tabClose(id)
      })
    }

  }
  //6.侧边栏编辑
  const updateFileName = (id, title, isNew) => {
    // newPath should be different based on isNew
    //if isNew is false, path should be old dirname + new title
    const newPath = isNew ? join(savedLocation, `${title}.md`)
    : join(dirname(files[id].path), `${title}.md`)
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath}
    const newFiles = {...files, [id]: modifiedFile};
    console.log('侧边栏编辑')
    if (isNew) {
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles)
        saveFilestoStore(newFiles)
      })
    } else {
      const oldPath = files[id].path
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles)
        saveFilestoStore(newFiles)
      })
    }
  }

  // 7.搜索
  const fileSearch = (keyword) => {
    //fileter out the new list base on the keyword
    const newFiles = filesArr.filter(file => {
      // 注意过滤空格
      return file.title.includes(keyword.trim())
    })
    // console.log(newFiles)
    setSearchedFiles(newFiles)
  }

  // 新建文件
  const createNewFile = () => {
    //debugger
    const newID = uuidv4()

    const newFile = {
      id: newID,
      title: '',
      body: '## 请输入MarkDown',
      createdAt: new Date().getTime(),
      isNew: true,
    }
    console.log('新建文件')
    setFiles({...files, [newID]: newFile})
  }

  const saveCurrentFile = () => {
    const { path, body, title } = activeFile

    fileHelper.writeFile(path,
      body).then(() => {
        setUnsavedFileIDs(unsavedFileIDs.filter(id => id!==activeFile.id))
        // 如果打开自动保存
        // console.log('自动保存', getAutoSync())
        if(getAutoSync()) {
          ipcRenderer.send('upload-file', {key: `${title}.md`, path})
        }

      })
  }

  const importFiles = () => { 
    // 调用主进程
    remote.dialog.showOpenDialog({
      title: '选择导入的 Markdown 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        {name: 'Markdown files', extensions: ['md']}
      ]
    }).then(result => {
      // console.log(result.canceled)
      // console.log(result.filePaths)

      if(!result.canceled) {
        const paths = result.filePaths;
         //1. filter out the path we already have in electron store
        //["/Users/wangyu/Documents/aaa.md", "/Users/wangyu/Documents/bbb.md",]
        const filteredPaths = paths.filter(path => {
          const alreadyAdded = Object.values(files).find(file => {
            return file.path === path
          })
          return !alreadyAdded
        })
        //2. extend the path array to an array contains files info
        //[{id:'1', path: '', title: ''}]
        const importFilesArr = filteredPaths.map(path => {
          return {
            id: uuidv4(),
            title: basename(path, extname(path)),
            path,
          }
        })
        //3.get the new files object in flattenArr
        const newFiles = {...files, ...flattenArr(importFilesArr)}
        // console.log(newFiles)
        //4.setState and update electron store
        setFiles(newFiles);
        saveFilestoStore(newFiles)
        if(importFilesArr.length > 0) {
          remote.dialog.showMessageBox({
            type: 'info',
            title:`成功导入了${importFilesArr.length}个文件`,
            message:`成功导入了${importFilesArr.length}个文件`,
          })
        }

      }
    }).catch(err => {
      console.log(err)

    })
  }
  const activeFileUploaded = () => {
    const { id } = activeFile
    // 添加同步，更新时间戳
    const modifiedFile = { ...files[id], isSynced: true, updatedAt: new Date().getTime()}
    const newFiles = { ...files, [id]: modifiedFile}
    setFiles(newFiles) // 本地更新
    saveFilestoStore(newFiles)
  }

  const activeFileDownloaded = (event, message) => {
    console.log('云端更新')
    const currentFile = files[message.id]
    const { id, path } = activeFile
    fileHelper.readFile(path).then(value => {
      let newFile
      if(message.status == 'download-success') {
        console.log('download newFile')
        newFile= { ...files[id], body: value, isLoaded: true, isSynced: true, updatedAt: new Date().getTime()}
      } else {
        console.log('no newFile')
        newFile= { ...files[id], body: value, isLoaded: true}
      }

      const newFiles = { ...files, [id]: newFile}
      setFiles(newFiles)
      saveFilestoStore(newFiles)
    })
  }
  useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFiles,
    'save-edit-file': saveCurrentFile,
    'active-file-uploaded': activeFileUploaded,
    'file-downloaded': activeFileDownloaded,
    //11-9
    'loading-status': (message, status) => {
      setLoading(status)
    }

  })

  return (
    <div className="App container-fluid px-0">
    { isLoading &&   <Loader/>}
      <div className="row no-gutters">
        <div className="col-3 left-panel">
          <FileSearch title="我的云文档" onFileSearch={fileSearch}/>
          <FileList 
            files={fileListArr}
            onFileClick={fileClick}
            onFileDelete={deleteFile}
            onSaveEdit={updateFileName}
            ></FileList> 
            <div className="row no-gutters button-group">
              <div className="col">
                <BottomBtn text="新建" colorClass="btn-primary" 
                  icon={faPlus}
                  onBtnClick={()=> {createNewFile(); console.log('新建')}}
                  ></BottomBtn>
              </div>
              <div className="col">
                <BottomBtn text="导入" 
                  colorClass="btn-success" 
                  onBtnClick={importFiles}
                  icon={faFileImport}></BottomBtn>
              </div>
            </div>
        </div>
        <div className="col-9 right-panel">
        { !activeFile  &&
          <div className="start-page">
            选择或者创建新的 Markdown 文档
          </div>
        }
        {
          activeFile &&
          <>
            <TabList
            files={openedFiles}
            onTabClick={tabClick}
            activeId={activeFileID}
            onCloseTab={tabClose}
            unsaveIds={unsavedFileIDs}
            >
            </TabList>

            <SimpleMDE 
              key={activeFile && activeFile.id}
              onChange={(value)=> {fileChange(activeFile.id, value)}}
              value={activeFile && activeFile.body}
              options={{
                autofocus: true,
                minHeight: '515px',
                // etc.
            }}/>
            {/* <BottomBtn text="保存" 
              colorClass="btn-success" 
              icon={faSave}
              onBtnClick={saveCurrentFile}
            ></BottomBtn> */}
            { activeFile.isSynced && 
              <span classNamesync-status>已同步，上次同步{timeStampToString(activeFile.updatedAt)}</span>}
          </>
        }
        </div>
      </div>

    </div>
  );
}

export default App;
