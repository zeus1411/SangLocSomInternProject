import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({ type: DataType.STRING(255), unique: true, allowNull: false })
  username!: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  password!: string;

  @Column(DataType.STRING(255))
  fullname?: string;

  @Column(DataType.STRING(255))
  email?: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isactive?: boolean;
}
export default User;