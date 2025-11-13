// models/User.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  // userid dạng string
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  userid!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  name?: string;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  email?: string;

  // map sang cột "pass"
  @Column({ type: DataType.STRING, allowNull: false, field: 'pass' })
  password!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  type?: string;

  @Column({ type: DataType.BOOLEAN, allowNull: true, field: 'deletedyn', defaultValue: false })
  deletedYn?: boolean;

  @Column({ type: DataType.DATE, allowNull: true, field: 'deletedtime' })
  deletedTime?: Date;
}

export default User;
