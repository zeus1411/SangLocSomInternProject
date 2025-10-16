import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import {DatasetMember} from './DatasetMember';
import {FormInstanceValue} from './FormInstanceValue';

@Table({ tableName: 'dataelement', timestamps: false })
export class DataElement extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING(512))
  code?: string;

  @Column(DataType.TEXT)
  name?: string;

  @Column(DataType.TEXT)
  itemlist?: string;

  @Column(DataType.CHAR(1))
  trial644?: string;

  @HasMany(() => DatasetMember)
  datasetMembers?: DatasetMember[];

  @HasMany(() => FormInstanceValue)
  formInstanceValues?: FormInstanceValue[];
}

export default DataElement;
