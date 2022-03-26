import { FileAuthorization } from '../enums/file-authorization.enum';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UploadPostDto {
  @IsEnum(FileAuthorization)
  permission: FileAuthorization;

  @IsString()
  @MinLength(4)
  @MaxLength(30)
  @IsOptional()
  password?: string;

  @IsNumber()
  @Min(1)
  @Max(30)
  expiredDate: number;

  @IsNumber()
  @Min(0)
  @Max(10000)
  downloadLimit: number;
}
