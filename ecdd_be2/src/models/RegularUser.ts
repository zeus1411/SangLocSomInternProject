import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: false })
export class RegularUser extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({ type: DataType.STRING, field: 'userid' })
  userId?: string;

  @Column(DataType.STRING)
  name?: string;

  @Column(DataType.STRING)
  email?: string;

  @Column({ type: DataType.STRING, field: 'pass' })
  password?: string;

  @Column(DataType.STRING)
  type?: string;

  @Column({ type: DataType.BOOLEAN, field: 'deletedyn' })
  deletedYn?: boolean;

  @Column({ type: DataType.DATE, field: 'createdAt' })
  createdAt?: Date;

  @Column({ type: DataType.DATE, field: 'updatedAt' })
  updatedAt?: Date;

  @Column({ type: DataType.DATE, field: 'deletedtime' })
  deletedTime?: Date;
}

export default RegularUser;
