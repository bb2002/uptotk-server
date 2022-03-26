import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UploadFileEntity } from './upload-file.entity';
import { FileAuthorization } from '../enums/file-authorization.enum';

@Entity('uk_upload_groups')
export class UploadGroupEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({
    name: 'authorization',
    type: 'enum',
    enum: FileAuthorization,
    default: FileAuthorization.OPEN,
  })
  authorization: FileAuthorization;

  @Column({
    name: 'password',
    type: 'text',
    nullable: true,
  })
  password: string;

  @Column({
    name: 'expired_at',
    type: 'datetime',
  })
  expiredAt: Date;

  @Column({
    name: 'cur_download_cnt',
    type: 'int',
    default: 0,
  })
  currentDownloadCount: number;

  @Column({
    name: 'max_download_cnt',
    type: 'int',
    default: -1,
  })
  maxDownloadCount: number;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 20,
  })
  ipAddress: string;

  @OneToMany(
    () => UploadFileEntity,
    (uploadFileEntity) => uploadFileEntity.uploadGroup,
  )
  files: UploadFileEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
