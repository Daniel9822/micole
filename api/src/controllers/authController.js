const { Auth, User, Colegio, Provincia, Distrito } = require("../db");
const { generateToken } = require("../utils/generateToken");
const mailer = require("../utils/sendMails/mailer");

const getResponse = (from, auth, data) => {
  return from === "Colegio"
    ? {
        id: data.id,
        email: auth.email,
        nombre_responsable: data.nombre_responsable,
        apellidos_responsable: data.apellidos_responsable,
        ruc: data.ruc,
        telefono: data.telefono,
        rol: auth.rol,
      }
    : {
        id: data.id,
        email: auth.email,
        nombre: data.nombre,
        apellidos: data.apellidos,
        dni: data.dni,
        telefono: data.telefono,
        rol: auth.rol,
      };
};

const getAuth = async (req, res, next) => {
  const tokenUser = req.user;
  if (!tokenUser) {
    return next(401);
  }
  try {
    if (tokenUser.rol === "Colegio") {
      const dataColegio = await Colegio.findOne({
        where: { idAuth: tokenUser.id },
      });
      return res
        .status(200)
        .send({ user: getResponse("Colegio", tokenUser, dataColegio) });
    } else {
      const dataUser = await User.findOne({
        where: { idAuth: tokenUser.id },
      });
      return res
        .status(200)
        .send({ user: getResponse("Usuario", tokenUser, dataUser) });
    }
  } catch (error) {
    return next(error);
  }
};

const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(400);
  }
  try {
    const authInstance = await Auth.findOne({ where: { email } });
    if (!authInstance) {
      return next({
        statusCode: 404,
        message: "El usuario ingresado no existe",
      });
    }
    const validatePassword = await authInstance.comparePassword(password);
    if (!validatePassword) {
      return next({
        statusCode: 403,
        message: "Error en las credenciales de acceso",
      });
    }
    if (authInstance.rol === "Colegio") {
      const dataColegio = await Colegio.findOne({
        where: { idAuth: authInstance.id },
      });
      const jwToken = generateToken(authInstance.id);
      return res.status(200).send({
        user: getResponse("Colegio", authInstance, dataColegio),
        token: jwToken.token,
      });
    } else {
      const dataUser = await User.findOne({
        where: { idAuth: authInstance.id },
      });
      const jwToken = generateToken(authInstance.id);
      return res.status(200).send({
        user: getResponse("Usuario", authInstance, dataUser),
        token: jwToken.token,
      });
    }
  } catch (error) {
    return next(error);
  }
};

const editAuthById = async (req, res, next) => {
  const { email, password, telefono } = req.body;
  const tokenUser = req.user;
  if (!tokenUser) {
    return next(401);
  }
  try {
    const authInstance = await Auth.findByPk(tokenUser.id);
    if (!authInstance) {
      return next({
        statusCode: 400,
        message: "El usuario no existe en la BD",
      });
    }
    if (authInstance.rol === "Colegio") {
      if (telefono) {
        const user = await Colegio.findOne({
          where: { AuthId: authInstance.id },
        });
        user.telefono = telefono;
        await user.save();
      }
      if (email) {
        authInstance.email = email;
      }
      if (password) {
        authInstance.password = password;
      }
      await authInstance.save();
    }
    return res.status(200).send(authInstance);
  } catch (error) {
    return next(error);
  }
};

const signUp = async (req, res, next) => {
  const {
    email,
    password,
    nombre,
    apellidos,
    nombre_colegio,
    dni,
    ruc,
    telefono,
    DistritoId,
    esColegio,
  } = req.body;

  try {
    // Validaciones
    if (esColegio) {
      const colegioValidation = Colegio.build({
        nombre_responsable: nombre,
        apellidos_responsable: apellidos,
        nombre_colegio,
        telefono,
        ruc,
        DistritoId,
      });
      await colegioValidation.validate();
    } else {
      const userValidation = User.build({
        nombre,
        apellidos,
        dni,
      });
      await userValidation.validate();
    }

    const isUserRegistered = await Auth.findOne({ where: { email } });
    if (isUserRegistered) {
      return next({
        statusCode: 400,
        message: "El email de usuario ya está registrado",
      });
    }
    const newAuth = await Auth.create({
      email,
      password,
      rol: esColegio ? "Colegio" : "Usuario",
    });
    const idAuth = newAuth.id;
    if (esColegio) {
      const { ProvinciaId } = await Distrito.findByPk(DistritoId);
      const { DepartamentoId } = await Provincia.findByPk(ProvinciaId);
      const newColegio = await Colegio.create({
        nombre_responsable: nombre,
        apellidos_responsable: apellidos,
        nombre_colegio,
        telefono,
        ruc,
        DistritoId,
        ProvinciaId,
        DepartamentoId,
        idAuth,
        PlanPagoId: 1
      });
      const sanitizedSchool = {
        email: newAuth.email,
        nombre_responsable: newColegio.nombre_responsable,
        apellidos_responsable: newColegio.apellidos_responsable,
        nombre: newColegio.nombre_colegio,
        rol: newAuth.rol,
      };
      //mailer.sendMailSignUp(sanitizedSchool, "Colegio"); //Enviamos el mail de Confirmación de Registro para el Usuario Colegio
      return res.status(201).send(sanitizedSchool);
    }
    const newUser = await User.create({ nombre, apellidos, dni, idAuth });
    const sanitizedUser = {
      email: newAuth.email,
      nombre: `${newUser.nombre} ${newUser.apellidos}`,
      rol: newAuth.rol,
      avatar: newUser.avatar,
    };
    //mailer.sendMailSignUp(sanitizedUser, "User"); //Enviamos el mail de Confirmación de Registro para el Usuario Normal
    return res.status(201).send(sanitizedUser);
  } catch (error) {
    return next(error);
  }
};

const putAuth = async (req, res, next) => {
  const { id } = req.params;
  const { email, password, newEmail, telefono, newPassword } = req.body;
  try {
    const authInstance = await Auth.findOne({ where: { email } });
    if (!authInstance) {
      return next({
        statusCode: 404,
        message: "El usuario ingresado no existe",
      });
    }
    const validatePassword = await authInstance.comparePassword(password);
    if (!validatePassword) {
      return res
        .status(403)
        .send({ error: "La contraseña ingresada no es correcta" });
    }
    if (newEmail) {
      authInstance.email = newEmail;
    }
    if (newPassword) {
      authInstance.password = newPassword;
    }
    await authInstance.save();

    const coleUpdate = await Colegio.update(
      {
        telefono,
      },
      { where: { id } }
    );
    const sanitizedAuth = {
      email: authInstance.email,
      rol: authInstance.rol,
      telefono: coleUpdate.telefono,
      nombre: coleUpdate.nombre_colegio,
    };
    return res.status(200).send(sanitizedAuth);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  signIn,
  signUp,
  editAuthById,
  getAuth,
  putAuth,
};
