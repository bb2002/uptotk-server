import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import * as moment from 'moment';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const UPLOAD_PATH = 'uploads';

export const multerDiskOptions: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      const uploadPath = `${UPLOAD_PATH}/${moment().format('YYYYMMDD')}`;

      // 폴더가 없는 경우 새로 만듭니다.
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }

      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      callback(null, uuidv4());
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 1024 * 2,
    files: 5,
  },
};
