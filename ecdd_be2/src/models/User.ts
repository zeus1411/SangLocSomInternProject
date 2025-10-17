import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { AdminRole } from './AdminRole';

@Table({ tableName: 'admin_users', timestamps: true, createdAt: 'createdAt', updatedAt: 'updatedAt', deletedAt: 'deletedAt' })
export class User extends Model {
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

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'active' })
  status!: string;

  @Column({ type: DataType.STRING, field: 'phoneNumber' })
  phoneNumber?: string;

  @Column({ type: DataType.DATE, field: 'birthday' })
  birthday?: Date;

  @Column({ type: DataType.STRING, field: 'gender' })
  gender?: string;

  @ForeignKey(() => AdminRole)
  @Column({ field: 'adminRoleId' })
  adminRoleId?: number;

  @Column({ field: 'orgunitid' })
  orgUnitId?: number;

  @BelongsTo(() => AdminRole)
  adminRole?: AdminRole;
}

export default User;