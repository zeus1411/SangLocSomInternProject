import { Table, Column, Model, DataType, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'admin_roles', timestamps: true })
export class AdminRole extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  code!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column(DataType.STRING)
  description?: string;

  @Column({ 
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
    defaultValue: []
  })
  permissions!: string[];

  @HasMany(() => User)
  users?: User[];
}

export default AdminRole;
