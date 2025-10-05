import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import {Program} from './Program';
import {FormMember} from './FormMember';
import {FormInstance} from './FormInstance';

@Table({ tableName: 'form', timestamps: false })
export class Form extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING(50))
  code?: string;

  @Column(DataType.STRING(512))
  name?: string;

  @ForeignKey(() => Program)
  @Column(DataType.INTEGER)
  programid?: number;

  @Column(DataType.STRING(50))
  filterfrom?: string;

  @Column(DataType.STRING(50))
  filterto?: string;

  @Column(DataType.TEXT)
  explain?: string;

  @BelongsTo(() => Program)
  program?: Program;

  @HasMany(() => FormMember)
  formMembers?: FormMember[];

  @HasMany(() => FormInstance)
  formInstances?: FormInstance[];
}
