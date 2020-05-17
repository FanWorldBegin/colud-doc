import React from 'react';
import logo from './logo.svg';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css"
import FileSearch from './components/FileSearch'
import defaultFiles from './utils/defaultFiles'
import FileList from './components/FileList'
function App() {
  return (
    <div className="App container-fluid">
      <div className="row">
        <div className="col-6 left-panel">
          <FileSearch title="我的云文档" onFileSearch={(value) => { console.log(value)}}/>
          <FileList 
            files={defaultFiles}
            onFileClick={(id)=> { console.log(id)}}
            onFileDelete={(id)=> { console.log("delets",id)}}
            onSaveEdit={(id, newValue) => { console.log("id",id); console.log("newValue",newValue);}}
            ></FileList> 
        </div>
        <div className="col-6 bg-primary right-panel">
          <h1>right</h1>
        </div>
      </div>

    </div>
  );
}

export default App;
