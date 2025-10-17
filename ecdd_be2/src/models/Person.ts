import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { OrgUnit } from './Orgunit';

@Table({ tableName: 'person', timestamps: false })
export class Person extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({ type: DataType.DATE, field: 'birthday' })
  birthday?: Date;

  @Column({ type: DataType.CHAR(1), field: 'gender' })
  gender?: string;

  @ForeignKey(() => OrgUnit)
  @Column({ field: 'orgunitid' })
  orgUnitId?: number;

  @Column(DataType.STRING)
  name?: string;

  @Column({ type: DataType.STRING, field: 'idnumber' })
  idNumber?: string;

  @BelongsTo(() => OrgUnit)
  orgUnit?: OrgUnit;
}

export default Person;
