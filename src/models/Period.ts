import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import {FormInstance} from './FormInstance';

@Table({ tableName: 'period', timestamps: false })
export class Period extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING(255))
  code?: string;

  @Column(DataType.STRING(1024))
  name?: string;

  @Column(DataType.STRING(4000))
  note?: string;

  @Column(DataType.DATEONLY)
  fromdate?: Date;

  @Column(DataType.DATEONLY)
  todate?: Date;

  @Column(DataType.BOOLEAN)
  isactive?: boolean;

  @Column(DataType.DATEONLY)
  createddate?: Date;

  @Column(DataType.STRING(255))
  createdby?: string;

  @Column(DataType.DATEONLY)
  updateddate?: Date;

  @Column(DataType.STRING(255))
  updatedby?: string;

  @HasMany(() => FormInstance)
  formInstances?: FormInstance[];
}

