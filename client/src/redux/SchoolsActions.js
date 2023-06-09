import axios from "axios";
import Swal from "sweetalert2";
import {
  getVacantesGrados,
  getNiveles,
  cleanOneSchool,
  getSchools,
  getOneSchool,
  getError,
  isLoading,
  getDepartaments,
  filterByDepartament,
  getDistrits,
  getCategories,
  getProvincias,
  getInfraestructura,
  getPaises,
  getAfiliaciones,
  getGrados,
  getFilterSchool,
  getCitasAgendado,
  getHorarios,
  getPagination,
  getMetodos,
  getDificultades
} from "./SchoolsSlice";

export const getVacantes = (niveles) => (dispatch) => {
  dispatch(isLoading());
  axios
    .post("/grados/vacantes", { niveles })
    .then((res) => dispatch(getVacantesGrados(res.data)))
    .catch((err) => console.log(err));
};

export const getFilterHome = (distritos, grado, ingreso, page) => (dispatch) => {
  dispatch(isLoading());
  axios
    .get(`/colegios?distritos=${distritos}&grado=${grado}&ingreso=${ingreso}&limit=5&page=${page}`)
    .then((res) => {
      dispatch(getPagination(res.data))
      dispatch(getFilterSchool(res.data.colegios))
    })
    .catch((err) => dispatch(getError(err.message)));
};

export const getFilterListSchool = (data, page) => (dispatch) => {
  dispatch(isLoading());
  axios
    .post(`/colegios/filter?limit=5&page=${page}`, data)
    .then((res) => {
      dispatch(getPagination(res.data))
      dispatch(getFilterSchool(res.data.colegios))
    })
    .catch((err) => dispatch(getError(err.message)));
};

export const getAllGrados = () => (dispatch) => {
  dispatch(isLoading());
  axios
    .get("/grados")
    .then((res) => dispatch(getGrados(res.data)))
    .catch((err) => dispatch(getError(err.message)));
};

export const getAllAfiliaciones = () => (dispatch) => {
  dispatch(isLoading());
  axios
    .get("/afiliaciones")
    .then((res) => dispatch(getAfiliaciones(res.data)))
    .catch((err) => dispatch(getError(err.message)));
};

export const getAllProvincias = () => (dispatch) => {
  dispatch(isLoading());
  axios
    .get("/provincias")
    .then((res) => dispatch(getProvincias(res.data)))
    .catch((err) => dispatch(getError(err.message)));
};

export const getAllNiveles = () => (dispatch) => {
  dispatch(isLoading());
  axios
    .get("/niveles")
    .then((res) => dispatch(getNiveles(res.data)))
    .catch((err) => dispatch(getError(err.message)));
};

export const getAllPaises = () => (dispatch) => {
  dispatch(isLoading());
  axios
    .get("/paises")
    .then((res) => dispatch(getPaises(res.data)))
    .catch((err) => dispatch(getError(err.message)));
};

export const getAllCategories = () => (dispatch) => {
  dispatch(isLoading());
  axios
    .get("/categorias")
    .then((res) => dispatch(getCategories(res.data)))
    .catch((err) => dispatch(getError(err.message)));
};

export const getAllInfraestructura = () => (dispatch) => {
  dispatch(isLoading());
  axios
    .get("/infraestructuras")
    .then((res) => dispatch(getInfraestructura(res.data)))
    .catch((err) => dispatch(getError(err.message)));
};

export const getAllDistrits = () => (dispatch) => {
  dispatch(isLoading());
  axios
    .get("/distritos")
    .then((res) => dispatch(getDistrits(res.data)))
    .catch((err) => dispatch(getError(err.message)));
};

export const filterByDepartaments = (array) => (dispatch) => {
  dispatch(isLoading());
  dispatch(filterByDepartament(array));
};

export const getAllDepartaments = () => (dispatch) => {
  dispatch(isLoading());
  axios
    .get("/departamentos")
    .then((res) => dispatch(getDepartaments(res.data)))
    .catch((err) => dispatch(getError(err.message)));
};

export const getAllSchools = () => (dispatch) => {
  dispatch(isLoading());
  axios
    .get("/colegios")
    .then((res) => dispatch(getSchools(res.data.colegios)))
    .catch((err) => dispatch(getError(err.message)));
};

export const getSchoolDetail = (id) => (dispatch) => {
  dispatch(isLoading());
  axios
    .get(`/colegios/${id}`)
    .then((res) => dispatch(getOneSchool(res.data[0])))
    .catch((err) => dispatch(getError(err.message)));
};

export const clannDetailid = () => (dispatch) => {
  dispatch(isLoading());
  try {
    dispatch(cleanOneSchool());
  } catch (err) {
    dispatch(getError(err.response.data.error));
  }
};

export const postHorariosVacantes = (horarios,ColegioId) => (dispatch) => {
  console.log(ColegioId)
  console.log(horarios)
  dispatch(isLoading());
  try {
    axios
      .post("/horarios", { horarios , ColegioId })
      .then(res=>
        Swal.fire({
          icon: "success",
          title: "Horarios actualizados exitosamente!",
          text: "Cambios guardados",
        })
        )
      .catch((err) => console.log(err));
  } catch (error) {
    console.log(error)
  }
};

export const postCita = (cita) => (dispatch) => {
  const { celular, correo, date, time, modo, nombre, añoIngreso, grado } = cita;
  console.log("test")
 const  ColegioId = localStorage.getItem('ColegioId')

  dispatch(isLoading());
  try {    
    axios
      .post("/citas", {
        celular,
        correo,
        date,
        time,
        modo,
        nombre,
        ColegioId,
        añoIngreso,
        grado,
        ColegioId

      })
      .then(res=>{
        Swal.fire({
          icon: "success",
          title: "Perfecto !",
          text: "Tu colegio recibio tu cita espera a ser confirmada",
        });
      })
      // .then((res) => dispatch(getVacantesGrados(res.data)))
      .catch((err) =>{
        Swal.fire({
          icon: "error",
          title: "Algo salio mal",
          text: err.response.data.error,
        });
      });
  } catch (error) {
    console.log(error)
  }
};

export const getCitaAgendadas = () => (dispatch) => {
  dispatch(isLoading());
  const token = localStorage.getItem("token");
  token && 
  axios
    .get(`/citas`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => dispatch(getCitasAgendado(res.data)))
    .catch((err) => {
      Swal.fire({
        icon: "error",
        title: "Algo salio mal",
        text: err.response.data.error,
      });
    });
};



export const getHorariosSchool = () => (dispatch) => {

  dispatch(isLoading());
  const idColegio= localStorage.getItem('ColegioId')
  console.log(idColegio)
  axios
    .get(`/horarios/${idColegio}` )
    .then((res) => dispatch(getHorarios(res.data)))
    .catch((err) => {
      Swal.fire({
        icon: "error",
        title: "Algo salio mal",
        text: err.response.data.error,
      });
    });
};

export const getAllMetodos = () => (dispatch) => {
  dispatch(isLoading());
  try {
    axios
      .get("/metodos")
      .then((res) => dispatch(getMetodos(res.data)))
      .catch((err) => dispatch(getError(err.message)));
  } catch (error) {
    console.log(error)
  }
}

export const getAllDificultades = () => (dispatch) => {
  dispatch(isLoading());
  try {
    axios
      .get("/dificultades")
      .then((res) => dispatch(getDificultades(res.data)))
      .catch((err) => dispatch(getError(err.message)));
  } catch (error) {
    console.log(error)
  }
}


