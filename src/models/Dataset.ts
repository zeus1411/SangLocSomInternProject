import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import {FormMember} from './FormMember';
import {DatasetMember} from './DatasetMember';

@Table({ tableName: 'dataset', timestamps: false })
export class Dataset extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING(50))
  code?: string;

  @Column(DataType.STRING(50))
  name?: string;

  @Column(DataType.DECIMAL(18, 2))
  minscore?: number;

  @Column(DataType.DECIMAL(18, 2))
  maxscore?: number;

  @Column(DataType.TEXT)
  note?: string;

  @Column(DataType.TEXT)
  explain?: string;

  @HasMany(() => FormMember)
  formMembers?: FormMember[];

  @HasMany(() => DatasetMember)
  datasetMembers?: DatasetMember[];
}
