import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDTO {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateStatusDTO {
  @IsNotEmpty()
  @IsString()
  status!: string;
}
