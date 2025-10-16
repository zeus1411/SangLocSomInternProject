import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { FormInstanceValue } from './FormInstanceValue';
import {Form} from './Form';
import {Period} from './Period';
import {OrgUnit} from './Orgunit';

@Table({ tableName: 'form_instance', timestamps: false })
export class FormInstance extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.INTEGER)
  personid?: number;

  @Column(DataType.STRING(255))
  name?: string;

  @Column(DataType.STRING(255))
  birthday?: string;

  @Column(DataType.STRING(2000))
  address?: string;

  @Column(DataType.SMALLINT)
  months?: number;

  @Column(DataType.DATE)
  createddate?: Date;

  @Column(DataType.STRING(255))
  createdby?: string;

  @ForeignKey(() => Form)
  @Column(DataType.SMALLINT)
  formid?: number;

  @Column(DataType.STRING(2000))
  description?: string;

  @Column(DataType.BOOLEAN)
  ispasses?: boolean;

  @Column(DataType.BOOLEAN)
  gender?: boolean;

  @Column(DataType.STRING(255))
  parentname?: string;

  @Column(DataType.STRING(255))
  phone?: string;

  @Column(DataType.STRING(512))
  surveyby?: string;

  @Column(DataType.STRING(255))
  surveyplace?: string;

  @ForeignKey(() => Period)
  @Column(DataType.INTEGER)
  periodid?: number;

  @ForeignKey(() => OrgUnit)
  @Column(DataType.INTEGER)
  orgunitid?: number;

  @Column(DataType.INTEGER)
  provinceid?: number;

  @Column(DataType.INTEGER)
  districtid?: number;

  @BelongsTo(() => Form)
  form?: Form;

  @BelongsTo(() => OrgUnit)
  orgunit?: OrgUnit;

  @BelongsTo(() => Period)
  period?: Period;

  @HasMany(() => FormInstanceValue)
  formInstanceValues?: FormInstanceValue[];
}

export default FormInstance;