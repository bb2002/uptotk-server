import { UploadFileEntity } from '../../upload/entities/upload-file.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('uk_download_details')
export class DownloadDetailEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  // 대상 유저의 IP Address
  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 255,
  })
  ipAddress: string;

  // 대상 유저가 이 파일을 몇 번 다운로드 했는가?
  @Column({
    name: 'cur_download_cnt',
    type: 'int',
  })
  currentDownloadCount: number;

  // 대상 파일
  @ManyToOne(
    () => UploadFileEntity,
    (uploadFileEntity) => uploadFileEntity.downloadDetails,
  )
  fileEntity: UploadFileEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
