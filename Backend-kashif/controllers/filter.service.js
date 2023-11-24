import { Employee } from "../models/employeeModel.js";
import {
  res_catch,
  res_failed,
  res_success,
} from "../global/response.js";

//? Find All Employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({});

    if (!employees) {
      return res_failed(res, "Employees are not found");
    }
    res_success(res, "Employees", employees);
  } catch (err) {
    res_catch(res, err);
  }
};

//? Find Employee experience
