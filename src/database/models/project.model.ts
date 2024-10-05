import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { ChatRoom } from './chatroom.model';
import { IProjectModel } from 'src/types';
import { Optional } from 'sequelize';

export interface ProjectCreationAttributes
  extends Optional<IProjectModel, 'id' | 'createdAt'> {}

@Table({
  paranoid: true,
})
export class Project extends Model<IProjectModel, ProjectCreationAttributes> {
  @Column
  name: string;

  @Column({
    type: DataType.TEXT,
  })
  access_token: string;

  @Column
  access_token_expires: Date;

  @Column
  project_id: string;

  @Column
  instagram_id: string;

  @HasMany(() => ChatRoom)
  chatrooms: ChatRoom[];
}
