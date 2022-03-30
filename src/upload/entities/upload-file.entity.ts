import { DownloadDetailEntity } from 'src/download/entities/download-detail.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UploadGroupEntity } from './upload-group.entity';

@Entity('uk_upload_files')
export class UploadFileEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({
    name: 'folder_name',
    type: 'varchar',
    length: 200,
  })
  folderName: string;

  @Column({
    name: 'saved_filename',
    type: 'varchar',
    length: 200,
  })
  savedFilename: string;

  @Column({
    name: 'original_filename',
    type: 'text',
  })
  originalFilename: string;

  @Column({
    name: 'mime_type',
    type: 'varchar',
    length: 200,
  })
  mimeType: string;

  @Column({
    name: 'file_capacity',
    type: 'int',
  })
  fileCapacity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 이 파일이 속한 업로드 그룹
  @ManyToOne(
    () => UploadGroupEntity,
    (uploadGroupEntity) => uploadGroupEntity.files,
    {
      onDelete: 'SET NULL',
    },
  )
  uploadGroup: UploadGroupEntity;

  // 이 파일을 다운로드 한 유저들 정보
  @OneToMany(
    () => DownloadDetailEntity,
    (downloadDetailEntity) => downloadDetailEntity.fileEntity,
  )
  downloadDetails: DownloadDetailEntity[];
}
