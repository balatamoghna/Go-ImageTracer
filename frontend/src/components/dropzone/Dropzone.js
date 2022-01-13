import React, { useState, useEffect, useRef } from 'react';
import './Dropzone.css';


const Dropzone = ()=>{
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [validFiles, setValidFiles] = useState([]);
    const [unsupportedFiles, setUnsupportedFiles] = useState([]);
    const fileInputRef = useRef();
    

    useEffect(() => {
        let filteredArray = selectedFiles.reduce((file, current) => {
            const x = file.find(item => item.name === current.name);
            if (!x) {
                return file.concat([current]);
            } else {
                return file;
            }
        }, []);
        setValidFiles([...filteredArray]);
    
    }, [selectedFiles]);
    
    const dragOver = (e) => {
        e.preventDefault();
    }
    
    const dragEnter = (e) => {
        e.preventDefault();
    }
    
    const dragLeave = (e) => {
        e.preventDefault();
    }
    
    const fileDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFiles(files);
        }
        
    }
    
    const handleFiles = (files) => {
        for(let i = 0; i < files.length; i++) {
            if (validateFile(files[i])) {
                setSelectedFiles(prevArray => [...prevArray, files[i]]);
            } else {
                files[i]['invalid'] = true;
                setSelectedFiles(prevArray => [...prevArray, files[i]]);
                setErrorMessage('File type not permitted');
                setUnsupportedFiles(prevArray => [...prevArray, files[i]]);
            }
        }
    }
    
    const validateFile = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (validTypes.indexOf(file.type) === -1) {
            return false;
        }
        return true;
    }

    const fileSize = (size) => {
        if (size === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    const fileType = (fileName) => {
        return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length) || fileName;
    }
    const removeFile = (name) => {
        // find the index of the item
        // remove the item from array
        const unsupportedFileIndex = unsupportedFiles.findIndex(e => e.name === name);
    if (unsupportedFileIndex !== -1) {
        unsupportedFiles.splice(unsupportedFileIndex, 1);
        // update unsupportedFiles array
        setUnsupportedFiles([...unsupportedFiles]);
    }
        const validFileIndex = validFiles.findIndex(e => e.name === name);
        validFiles.splice(validFileIndex, 1);
        // update validFiles array
        setValidFiles([...validFiles]);
        const selectedFileIndex = selectedFiles.findIndex(e => e.name === name);
        selectedFiles.splice(selectedFileIndex, 1);
        // update selectedFiles array
        setSelectedFiles([...selectedFiles]);
        
    }

    const fileInputClicked = () => {
        fileInputRef.current.click();
    }

    const filesSelected = () => {
        if (fileInputRef.current.files.length) {
            handleFiles(fileInputRef.current.files);
        }
    }

    const uploadFiles = () => {
        
        while (validFiles.at(-1)!==undefined) {
            if(backendSend(validFiles.at(-1))){
            validFiles.pop();
            setValidFiles([...validFiles]);
            selectedFiles.pop();
            setSelectedFiles([...selectedFiles]);}
            else {break;}
            }
        
    }

    const backendSend = (file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        let flag=false;
        reader.onload = function(e) {
            
            //console.log(e.target.result.split(",")[1]);
            //console.log(file.name);
            window.backend.basic(file.name,e.target.result.split(",")[1]).then((result)=>flag=result);
            // return flag;
            
        }
        //TODO: FIX FOR PROMISES
        return true;
    }

    
    
    return(
    <div className="container">
        {unsupportedFiles.length === 0 && validFiles.length ? <button className="file-upload-btn" onClick={() => uploadFiles()}>Upload Files</button> : ''} 
        {unsupportedFiles.length ? <p>Please remove all unsupported files.</p> : ''}
        <div className="drop-container" onClick={fileInputClicked}
        onDragOver={dragOver}
        onDragEnter={dragEnter}
        onDragLeave={dragLeave}
        onDrop={fileDrop}
        >
            <div className="drop-message">
            <input
    ref={fileInputRef}
    className="file-input"
    type="file"
    multiple
    onChange={filesSelected}
/>
            <div className="upload-icon"></div>
             Drag & Drop files here or click to upload
            </div>
        </div>
        
        <div className="file-display-container">
        
    {
        validFiles.map((data, i) => 
            <div className="file-status-bar" key={i} >
                <div>
                    
                    <div className="file-type">{fileType(data.name)}</div>
                    <span className={`file-name ${data.invalid ? 'file-error' : ''}`}>{data.name}</span>
                    <span className="file-size">({fileSize(data.size)})</span> {data.invalid && <span className='file-error-message'>({errorMessage})</span>}
                </div>
                <div className="file-remove" onClick={() => removeFile(data.name)}>X</div>
            </div>
            
        )
        
    }
    
</div>

</div>
    
    
    )
}


export default Dropzone;