import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';

// Import tất cả các model
import User from '../models/User';
import OrgUnit from '../models/Orgunit';
import Form from '../models/Form';
import FormInstance from '../models/FormInstance';
import DataElement from '../models/DataElement';
import Dataset from '../models/Dataset';
import Program from '../models/Program';
import Period from '../models/Period';
import FormMember from '../models/FormMember';
import DatasetMember from '../models/DatasetMember';
import FormInstanceValue from '../models/FormInstanceValue';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'sang_loc_som_demo',
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  models: [
    User,
    OrgUnit,
    Form,
    FormInstance,
    DataElement,
    Dataset,
    Program,
    Period,
    FormMember,
    DatasetMember,
    FormInstanceValue
    // Thêm các model khác vào đây
  ],
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;