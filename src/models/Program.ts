import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import {Form} from './Form';

@Table({ tableName: 'program', timestamps: false })
export class Program extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING(50))
  code?: string;

  @Column(DataType.STRING(512))
  name?: string;

  @Column(DataType.STRING(1024))
  note?: string;

  @Column(DataType.CHAR(1))
  trial651?: string;

  @HasMany(() => Form)
  forms?: Form[];
}
export default Program;
