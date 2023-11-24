import express from 'express';
//@ controllers
import { getAllEmployees } from '../controllers/filter.service.js';
//@ middlewares
import { isAuthenticated } from '../middlewares/Authenticated.js';
const filterRouter = express.Router();

//? Filter routes
