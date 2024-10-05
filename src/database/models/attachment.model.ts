import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Message } from './message.model';
import { AttachmentType, IAttachmentModel } from 'src/types';
import { Optional } from 'sequelize';

interface AttachmentCreationAttributes
  extends Optional<IAttachmentModel, 'id' | 'createdAt'> {}

@Table({
  paranoid: true,
})
export class Attachment extends Model<
  IAttachmentModel,
  AttachmentCreationAttributes
> {
  @Column
  type: AttachmentType;

  @Column({
    type: DataType.TEXT,
  })
  content: string;

  @ForeignKey(() => Message)
  @Column
  message_id!: number;

  @BelongsTo(() => Message)
  message!: Message;
}
