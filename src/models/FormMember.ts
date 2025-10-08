import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import {Form} from './Form';
import {Dataset} from './Dataset';

@Table({ tableName: 'formmember', timestamps: false })
export class FormMember extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Form)
  @Column(DataType.INTEGER)
  formid?: number;

  @ForeignKey(() => Dataset)
  @Column(DataType.INTEGER)
  datasetid?: number;

  @Column(DataType.INTEGER)
  orderno?: number;

  @Column(DataType.CHAR(1))
  trial647?: string;

  @BelongsTo(() => Form)
  form?: Form;

  @BelongsTo(() => Dataset)
  dataset?: Dataset;
}

export default FormMember;
