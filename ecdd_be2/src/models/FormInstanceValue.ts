import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import {FormInstance} from './FormInstance';
import {DatasetMember} from './DatasetMember';
import {DataElement} from './DataElement';

@Table({ tableName: 'form_instance_value', timestamps: false })
export class FormInstanceValue extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => FormInstance)
  @Column(DataType.INTEGER)
  forminstanceid?: number;

  @ForeignKey(() => DatasetMember)
  @Column(DataType.INTEGER)
  datasetmemberid?: number;

  @Column(DataType.STRING(2000))
  value?: string;

  @Column(DataType.DATE)
  createddate?: Date;

  @Column(DataType.STRING(255))
  createdby?: string;

  @ForeignKey(() => DataElement)
  @Column(DataType.INTEGER)
  dataelementid?: number;

  @BelongsTo(() => FormInstance)
  formInstance?: FormInstance;

  @BelongsTo(() => DatasetMember)
  datasetMember?: DatasetMember;

  @BelongsTo(() => DataElement)
  dataElement?: DataElement;
}

export default FormInstanceValue;
