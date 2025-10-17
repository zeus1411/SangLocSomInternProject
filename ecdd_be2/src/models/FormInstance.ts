import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { FormInstanceValue } from './FormInstanceValue';
import { Form } from './Form';
import { Period } from './Period';
import { OrgUnit } from './Orgunit';
import { Person } from './Person';

@Table({ tableName: 'form_instance', timestamps: false })
export class FormInstance extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING(255))
  name?: string;

  @Column(DataType.STRING(255))
  birthday?: string;

  @Column(DataType.STRING(2000))
  address?: string;

  @Column(DataType.INTEGER)
  months?: number;

  @Column(DataType.STRING(2000))
  description?: string;

  @Column(DataType.BOOLEAN)
  ispasses?: boolean;

  @Column(DataType.BOOLEAN)
  gender?: boolean;

  @Column(DataType.STRING(255))
  parentname?: string;

  @Column(DataType.STRING(50))
  phone?: string;

  @Column(DataType.STRING(255))
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

  @ForeignKey(() => Person)
  @Column(DataType.INTEGER)
  personid?: number;

  @ForeignKey(() => Form)
  @Column(DataType.INTEGER)
  formid?: number;

  @Column({ type: DataType.DATE, field: 'createddate' })
  createdDate?: Date;

  @Column({ type: DataType.STRING, field: 'createdby' })
  createdBy?: string;

  @Column({ type: DataType.DATE, field: 'updateddate' })
  updatedDate?: Date;

  @Column({ type: DataType.STRING, field: 'updatedby' })
  updatedBy?: string;

  @Column({ type: DataType.STRING, field: 'surveynote' })
  surveyNote?: string;

  @BelongsTo(() => Form)
  form?: Form;

  @BelongsTo(() => OrgUnit)
  orgunit?: OrgUnit;

  @BelongsTo(() => Period)
  period?: Period;

  @BelongsTo(() => Person)
  person?: Person;

  @HasMany(() => FormInstanceValue)
  formInstanceValues?: FormInstanceValue[];
}

export default FormInstance;