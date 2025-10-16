import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import {Dataset} from './Dataset';
import {DataElement} from './DataElement';
import {FormInstanceValue} from './FormInstanceValue';

@Table({ tableName: 'datasetmember', timestamps: false })
export class DatasetMember extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Dataset)
  @Column(DataType.INTEGER)
  datasetid?: number;

  @ForeignKey(() => DataElement)
  @Column(DataType.INTEGER)
  dataelementid?: number;

  @Column(DataType.STRING(50))
  controltype?: string;

  @Column(DataType.TEXT)
  valuelist?: string;

  @Column(DataType.INTEGER)
  orderno?: number;

  @Column(DataType.TEXT)
  dataelementname?: string;

  @Column(DataType.DECIMAL(18, 0))
  score?: number;

  @BelongsTo(() => Dataset)
  dataset?: Dataset;

  @BelongsTo(() => DataElement)
  dataelement?: DataElement;

  @HasMany(() => FormInstanceValue)
  formInstanceValues?: FormInstanceValue[];
}

export default DatasetMember;
