import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css"
import FileSearch from './components/FileSearch'
import defaultFiles from './utils/defaultFiles'
import FileList from './components/FileList'
import TabList from './components/TabList'
import BottomBtn from './components/BottomBtn'
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [files, setFiles ] = useState(defaultFiles)
  const [ activeFileID, setActiveFileID ] = useState('')
  const [ openedFileIDs, setOpenedFileIDs ] = useState([])
  const [ unsavedFileIDs, setUnsavedFileIDs ] = useState([])
  const [searchedFiles, setSearchedFiles] = useState([])
  const openedFiles = openedFileIDs.map( openID => {
    return files.find(file => file.id == openID)
  }) // 获取开启的tab信息

  // 添加处理数据的方法
  //1.点击list右侧出现tab
  const fileClick = (fileID) => {
    // set current active file
    setActiveFileID(fileID);
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
    //1.loop through file array to update to new value
    const newFiles = files.map(file => {
      if(file.id == id) {
        file.body = value
      }
      return file
    })
    // 设置新的文件body
    setFiles(newFiles)
    // update unsavedIDs
    if(!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id])
    }
  }

  //5.侧边栏删除
  const deleteFile = (id) => {
    // filter out the current file id
    const newFiles = files.filter(file => file.id !== id)
    setFiles(newFiles)
    // close the tab if  opened
    tabClose(id)
  }
  //6.侧边栏编辑
  const updateFileName = (id, title) => {
    // loop through files and update the title
    const newFiles = files.map(file => {
      if(file.id == id) {
        file.title = title
        file.isNew = false
      }
      return file
    })
    console.log('侧边栏编辑')
    setFiles(newFiles)
  }

  // 7.搜索
  const fileSearch = (keyword) => {
    //fileter out the new list base on the keyword
    const newFiles = files.filter(file => {
      // 注意过滤空格
      return file.title.includes(keyword.trim())
    })
    console.log(newFiles)
    setSearchedFiles(newFiles)
  }

  // 新建文件
  const createNewFile = () => {
    //debugger
    const newID = uuidv4()
    const newFiles = [
      ...files, 
      {
        id: newID,
        title: '',
        body: '## 请输入MarkDown',
        createAt: new Date().getTime(),
        isNew: true,

      }
    ]
    console.log('新建文件')
    setFiles(newFiles)
  }
  // 获取当前激活File
  const activeFile = files.find(file => file.id == activeFileID) // 获取开启的tab信息

  const fileListArr = (searchedFiles.length > 0) ? searchedFiles : files;

  return (
    <div className="App container-fluid px-0">
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
                <BottomBtn text="倒入" colorClass="btn-success" icon={faFileImport}></BottomBtn>
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
              }}/>;
          </>
        }
        </div>
      </div>

    </div>
  );
}

export default App;
