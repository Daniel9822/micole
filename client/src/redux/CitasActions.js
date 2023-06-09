import axios from "axios";
import {
  getCitas,
  updateTasks,
  updateColumns,
  getError,
  isLoading,
  getSuccess,
  cleanSuccess,
} from "./CitasSlice";
import Swal from 'sweetalert2'
export const getCita = () => (dispatch) => {
  dispatch(isLoading());
  const token = localStorage.getItem("token");
  axios
    .get(`/citas`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => dispatch(getCitas(res.data)))
    .catch((err) => {
      dispatch(getError(err.response.data.error));
      // Swal.fire({
      //   icon: "error",
      //   title: "Oops...",
      //   text: err.response.data.error,
      // });
    });
};

export const updateTask = (taskId, NuevoEstado) => (dispatch) => {
  const idCita = taskId.idCita;

  axios
    .put(`/citas/${idCita}`, { estado: NuevoEstado })
    .then((res) => console.log(res.data))
    .catch((err) => {
      dispatch(getError(err.response.data.error));
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err.response.data.error,
      });
    });
};
export const updateColumn = (newColumn) => (dispatch) => {

  dispatch(updateColumns(newColumn));
};
export const putCita = (idCita) => (dispatch) => {

  dispatch(isLoading());
  axios
    .put(`/citas/activo/${idCita}`, { activo: true })
    .then((res) => dispatch(getSuccess(res.data)))
    .catch((err) => {
      dispatch(getError(err.response.data.error));
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err.response.data.error,
      });
    });
};

// citaRouter.delete("/:idCita", deleteCita);

export const deleteCita = (idCita) => (dispatch) => {
  console.log(idCita);
  axios
    .delete(`/citas/${idCita}`)
    .then((res) =>{ 
      dispatch(getSuccess(res.data))
      Swal.fire({
        icon: "success",
        title: "Cita cancelada con exito",
        text: 'Se notificará a la familia interesada',
      });
    })
    .catch((err) => {
      dispatch(getError(err.response.data.error));
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err.response.data.error,
      });
    });
};

export const cleanSuccessState = () => (dispatch) => {

  try {
    dispatch(cleanSuccess());
  } catch (err) {
    dispatch(getError(err.response.data.error));
  }
};
