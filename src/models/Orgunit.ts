import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import {FormInstance} from './FormInstance';

@Table({ tableName: 'orgunit', timestamps: false })
export class OrgUnit extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING(50))
  code?: string;

  @Column(DataType.STRING(50))
  name?: string;

  @ForeignKey(() => OrgUnit)
  @Column(DataType.INTEGER)
  parentid?: number;

  @Column(DataType.INTEGER)
  level?: number;

  @BelongsTo(() => OrgUnit, 'parentid')
  parent?: OrgUnit;

  @HasMany(() => OrgUnit, 'parentid')
  children?: OrgUnit[];

  @HasMany(() => FormInstance)
  formInstances?: FormInstance[];
}

export default OrgUnit;