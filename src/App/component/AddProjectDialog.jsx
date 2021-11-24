import {useEffect, useState} from 'react'
import Axios from 'axios'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@material-ui/core'

export default function AddProjectDialog({open, reloadProjects, handleClose}) {
  const [projectName, setProjectName] = useState("")
  const jwtToken = localStorage.getItem("jwtToken")

  const createProject = () => {
    if (projectName === "") {
      alert("不準啦馬的>///<")
    } else {

      Promise.all(checker)
        .then((response) => {
          if (response.includes(false) === false) {
            let payload = {
              projectName,
              githubRepositoryURL: "",
              sonarRepositoryURL: ""
            } // 傳空的repository

            Axios.post("http://localhost:9100/pvs-api/project", payload,
              {headers: {"Authorization": `${jwtToken}`}})
              .then(() => {
                reloadProjects()
                handleClose()
              })
              .catch((e) => {
                alert(e.response.status)
                console.error(e)
              }) // 回傳project name給後端去create project
          }
        }).catch((e) => {
        alert(e.response.status)
        console.error(e)
      })
    }
  }

  // 刷新
  useEffect(() => {
    setProjectName("")
  }, [open])

  // dialog 介面
  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
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
          onChange={(e) => {
            setProjectName(e.target.value)
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button id="CreateProjectBtn" onClick={createProject} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
