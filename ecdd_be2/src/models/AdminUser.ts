// models/AdminUser.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';
import { AdminRole } from './AdminRole';

@Table({
  tableName: 'admin_users',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class AdminUser extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  fullName!: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'active',
  })
  status!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  phoneNumber?: string;

  @Column({ type: DataType.DATE, allowNull: true })
  birthday?: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  gender?: string;

  @ForeignKey(() => AdminRole)
  @Column({ type: DataType.INTEGER, allowNull: true, field: 'adminRoleId' })
  adminRoleId?: number;

  @Column({ type: DataType.INTEGER, allowNull: true, field: 'orgunitid' })
  orgUnitId?: number;

  @BelongsTo(() => AdminRole)
  adminRole?: AdminRole;
}

export default AdminUser;
