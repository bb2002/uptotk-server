import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToOne(
    () => UploadGroupEntity,
    (uploadGroupEntity) => uploadGroupEntity.files,
  )
  uploadGroup: UploadGroupEntity;
}
