import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

import { User } from '../models/User';
import { RegularUser } from '../models/RegularUser';
import { Person } from '../models/Person';
import { AdminRole } from '../models/AdminRole';
import { OrgUnit } from '../models/Orgunit';
import { Form } from '../models/Form';
import { FormInstance } from '../models/FormInstance';
import { DataElement } from '../models/DataElement';
import { Dataset } from '../models/Dataset';
import { Program } from '../models/Program';
import { Period } from '../models/Period';
import { FormMember } from '../models/FormMember';
import { DatasetMember } from '../models/DatasetMember';
import { FormInstanceValue } from '../models/FormInstanceValue';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  models: [
    User,
    RegularUser,
    Person,
    AdminRole,
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