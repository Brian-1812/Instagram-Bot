import { Optional } from 'sequelize';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { IMessageModel } from 'src/types';
import { Attachment } from './attachment.model';
import { ChatRoom } from './chatroom.model';

interface MessageCreationAttributes
  extends Optional<IMessageModel, 'id' | 'createdAt'> {}

@Table({
  paranoid: true,
})
export class Message extends Model<IMessageModel, MessageCreationAttributes> {
  @Column({
    type: DataType.ENUM('text', 'attachment'),
    defaultValue: 'text',
  })
  type: IMessageModel['type'];

  @Column({
    type: DataType.TEXT,
  })
  text: string;

  @Column
  instagram_id: string;

  @Column
  sender_id: string;

  @Column
  receiver_id: string;

  @ForeignKey(() => ChatRoom)
  @Column
  chat_room_id!: number;

  @BelongsTo(() => ChatRoom)
  chat_room!: ChatRoom;

  @HasMany(() => Attachment)
  attachments?: Attachment[];
}
