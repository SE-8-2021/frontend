import { useEffect, useState } from 'react'
import Axios from 'axios'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material'

export default function AddProjectDialog({ open, reloadProjects, handleClose }) {
  const [projectName, setProjectName] = useState('')
  const jwtToken = localStorage.getItem('jwtToken')
  const memberId = localStorage.getItem('memberId')

  const createProject = async() => {
    if (projectName.trim() === '') {
      alert('不準啦馬的>///<')
      return
    }

    const payload = {
      memberId,
      projectName,
    }

    const headers = { ...(jwtToken && { Authorization: jwtToken }) }

    const sendPVSBackendRequest = async(method, url, data) => {
      const baseURL = 'http://localhost:9100/pvs-api'
      const requestConfig = {
        baseURL,
        url,
        method,
        headers,
        data,
      }
      return (await Axios.request(requestConfig))?.data
    }

    try {
      await sendPVSBackendRequest('POST', '/project', payload)
    }
    catch (e) {
      alert(e?.response?.status)
      console.error(e)
    } // 回傳給後端

    reloadProjects()
    handleClose()
  }

  // 刷新
  useEffect(() => {
    setProjectName('')
  }, [open])

  // dialog 介面
  return (
    <Dialog open={ open } onClose={ handleClose } aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Create Project</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To create a project, please enter the project name.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="ProjectName"
          label="Project Name"
          type="text"
          fullWidth
          onChange={ (e) => {
            setProjectName(e.target.value)
          } }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={ handleClose } color="secondary">
          Cancel
        </Button>
        <Button id="CreateProjectBtn" onClick={ createProject } color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
