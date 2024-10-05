import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Project } from './project.model';
import { Message } from './message.model';
import { IChatRoomModel } from 'src/types';
import { Optional } from 'sequelize';

interface ChatRoomCreationAttributes
  extends Optional<IChatRoomModel, 'id' | 'createdAt'> {}

@Table({
  paranoid: true,
})
export class ChatRoom extends Model<
  IChatRoomModel,
  ChatRoomCreationAttributes
> {
  @Column
  client_id: string;

  @Column
  instgram_conversation_id: string;

  @ForeignKey(() => Project)
  @Column
  project_id!: number;

  @BelongsTo(() => Project)
  project!: Project;

  @HasMany(() => Message)
  messages?: Message[];
}
