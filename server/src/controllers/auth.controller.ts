import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { executeRequest, sql } from "../utils/dbHandler";

interface Usuario {
  idUsuario: number;
  username: string;
  password: string;
  role: string;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, password, role = 'user' } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username y password son requeridos" });
    return;
  }

  try {
    // Verificar si el usuario ya existe
    const checkResult = await executeRequest({
      query: `SELECT * FROM usuario WHERE username = '${username}'`
    });

    // Si es que el resultado tiene una longitud mayor a 0, significa que el usuario ya existe.
    if (checkResult.recordset.length > 0) {
      res.status(400).json({ message: "El usuario ya existe" });
      return;
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    await executeRequest({
      query: `INSERT INTO usuario (username, password) VALUES ('${username}', '${hashedPassword}')`
    });

    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Nombre de usuario y contraseña son obligatorios!" });
    return;
  }

  try {
    const result = await executeRequest({
      query: `SELECT * FROM usuario WHERE username = '${username}'`
    });

    if (result.recordset.length === 0) {
      res.status(401).json({ message: "Usuario no encontrado" });
      return;
    }

    console.log("User from DB:", result.recordset[0]);
    const user = result.recordset[0] as Usuario;
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(401).json({ message: "Contraseña incorrecta" });
      return;
    }

    const token = jwt.sign(
      { id: user.idUsuario, username: user.username },
      process.env.JWT_SECRET || "mi_secreto_temporal",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        idUsuario: user.idUsuario,
        username: user.username,
        role: user.role
      },
      success: true
    });
    console.log(user);
    
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};