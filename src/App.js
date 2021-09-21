import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import DeleteIcon from '@mui/icons-material/Delete';
import { makeStyles } from '@material-ui/core/styles';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateTimePicker from '@mui/lab/DateTimePicker';
import CardContent from '@mui/material/CardContent';
import Button from "@material-ui/core/Button";
import Typography from '@mui/material/Typography';
import ReactPaginate from 'react-paginate';
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import dateFormat from "dateformat";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import EditIcon from '@mui/icons-material/Edit';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { fetchAllRecords, postRecord, putRecord, deleteRecord } from "./Fetch";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));
const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));
export default function App() {
  const initialState = {
    Full_Name: "",
    Email: "",
    Country: ""
  }
  const classes = useStyles();
  const [totalData, setTotalData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [postsPerPage] = useState(12);
  const [offset, setOffset] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [openModal, setOpenModal] = React.useState(false);
  const [openError, setOpenError] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [value, setValue] = React.useState(new Date());
  const [user, setUser] = useState(initialState);
  const [editing, setEditing] = useState(false);
  const handleUserChange = (event) => {
    const { name, value } = event.target;
    setUser({ ...user, [name]: value });
  };
  const getAllPosts = async () => {
    fetchAllRecords("http://localhost:5000/users")
      .then(rows => {

        const slice = rows.data.slice(offset - 1, offset - 1 + postsPerPage)
        // For displaying Data
        console.log(slice);
        setTotalData(slice);
        const postData = getPostData(slice);
        console.log(postData);
        setAllData(postData);
        setPageCount(Math.ceil(rows.data.length / postsPerPage))
      });
  }
  const handlePageClick = (event) => {
    const selectedPage = event.selected;
    setOffset(selectedPage + 1)
  };

  const handleDelete = data => {
    confirmAlert({
      // title: 'Confirm to submit',
      message: 'Are you sure you want to delete this user information ? ',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            DeleteDriver(data.Id);
          }
        },
        {
          label: 'No',
        }
      ]
    });
  };
  const DeleteDriver = (id) => {
    deleteRecord("http://localhost:5000/users/", id)
      .then(res => {
        console.log(res);
      });
  };
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenModal(false);
    setOpenError(false);
    setOpenSuccess(false);
  };
  const getPostData = (data) => {
    return (
      data.map(post =>
        <Grid item md={4}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>

                <Grid item md={12}>
                  <EditIcon
                    onClick={() => {
                      user.Full_Name = post.Full_Name;
                      user.Email = post.Email;
                      user.Country = post.Country;
                      setValue(post.Date_of_birth);
                      setEditing(true);
                      setOpenModal(true);
                    }}
                    style={{ float: "right", cursor: "pointer" }}
                  />
                  <DeleteIcon
                    onClick={() => {
                      handleDelete(post);
                    }}
                    style={{ float: "right", cursor: "pointer" }}
                  />
                </Grid>
                <Grid item md={4}>
                  <img style={{ width: "90%" }} src="https://upload.wikimedia.org/wikipedia/commons/7/70/User_icon_BLACK-01.png" />
                </Grid>
                <Grid item md={8}>
                  <Typography style={{ fontWeight: "600" }} variant="subtitle2" gutterBottom component="div">
                    Name:<span style={{ fontWeight: "200", color: "gray" }}>{post.Full_Name}</span>
                  </Typography>
                  <Typography style={{ fontWeight: "600" }} variant="subtitle2" gutterBottom component="div">
                    Email:<span style={{ fontWeight: "200", color: "gray" }}>{post.Email}</span>
                  </Typography>
                  <Typography style={{ fontWeight: "600" }} variant="subtitle2" gutterBottom component="div">
                    Date of birth:<span style={{ fontWeight: "200", color: "gray" }}>{dateFormat(post.Date_of_birth, " dd mmm yyyy")}</span>
                  </Typography>
                  <Typography style={{ fontWeight: "600" }} variant="subtitle2" gutterBottom component="div">
                    Country:<span style={{ fontWeight: "200", color: "gray" }}>{post.Country}</span>
                  </Typography>
                </Grid>
              </Grid>

            </CardContent>
          </Card>
        </Grid>
      )
    )

  }
  useEffect(() => {
    getAllPosts()
  }, [offset]);
  const handleInputChange = (event, value) => {
    const data = totalData.filter(res => {
      return res.Full_Name === value;
    });
    const postData = getPostData(data);
    setAllData(postData);
  }
  const saveUser = () => {
    console.log(user);
    setOpenModal(false);
    setOpen(true);
    postRecord("http://localhost:5000/users", user)
      .then(res => {
        console.log(res);
        setOpen(false);
      })
      .catch(err => {
        setOpen(false);
        setMessage("Error Occured");
        setOpenError(true);
      });
  }
  const updateUser = () => {
    setOpenModal(false);
    setOpen(true);
    putRecord("http://localhost:5000/users", user.Id, user)
      .then(res => {
        console.log(res);
        setOpen(false);
      })
      .catch(err => {
        setOpen(false);
        setMessage("Error Occured");
        setOpenError(true);
      });
  }
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }} >
      <Grid container spacing={2}>
        <Grid item md={10} xs={12}>
          <Autocomplete
            id="free-solo-demo"
            freeSolo
            options={totalData.map((option) => option)}
            getOptionLabel={(option) => `${option.Full_Name}`}
            onInputChange={handleInputChange}
            renderOption={(option) => (
              <>
                <span>{option.Full_Name} </span>
              </>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Search" margin="normal" variant="outlined" />
            )}
          />
        </Grid>
        <Grid item md={2}>
          <Button onClick={() => { setOpenModal(true); setEditing(false); }} color="primary" variant="contained" style={{ margin: "22px" }}>Add User</Button>
        </Grid>

        {allData}

        <Grid item md={12}>
          <ReactPaginate
            previousLabel={"previous"}
            nextLabel={"next"}
            breakLabel={"..."}
            breakClassName={"break-me"}
            pageCount={pageCount}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            subContainerClassName={"pages pagination"}
            activeClassName={"active"} />
        </Grid>
      </Grid>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={openModal}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          {editing ? (
            "Update Existing User"
          ) : (
            "Add New User"
          )}
        </DialogTitle>
        <DialogContent dividers>

          <form onSubmit={event => {
            event.preventDefault();
            if (editing) {
              updateUser();
            }
            else {
              saveUser();
            }
            setUser(initialState);
          }}>
            <Grid container spacing={2}>
              <Grid item md={12}>
                <TextField
                  id="outlined-basic"
                  label="Name"
                  variant="outlined"
                  onChange={handleUserChange}
                  name="Full_Name"
                  value={user.Full_Name}
                />
                <TextField
                  style={{ marginLeft: "60px" }}
                  id="outlined-basic"
                  label="Email"
                  variant="outlined"
                  onChange={handleUserChange}
                  name="Email"
                  value={user.Email}
                />
              </Grid>
              <Grid item md={12}>

              </Grid>
              <Grid item md={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    renderInput={(props) => <TextField {...props} />}
                    label="Date of birth"
                    value={value}
                    onChange={(newValue) => {
                      setValue(newValue);
                      user.dob = newValue;
                    }}
                  />
                </LocalizationProvider>
                <TextField
                  style={{ marginLeft: "60px" }}
                  id="outlined-basic"
                  label="Country"
                  variant="outlined"
                  onChange={handleUserChange}
                  name="Country"
                  value={user.Country}
                />
              </Grid>
            </Grid>
            {editing ? (
              <Button type="submit" color="primary" variant="contained" style={{ margin: "22px", float: "right" }}>Update</Button>
            ) : (
              <Button type="submit" color="primary" variant="contained" style={{ margin: "22px", float: "right" }}>Add</Button>
            )}

          </form>
        </DialogContent>
      </Dialog>
      <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={openError} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {message}
        </Alert>
      </Snackbar>
      <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={openSuccess} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          {message}
        </Alert>
      </Snackbar>
      <Backdrop className={classes.backdrop} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box >
  );
}