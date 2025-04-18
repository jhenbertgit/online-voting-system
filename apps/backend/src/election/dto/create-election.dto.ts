import { IsString, IsNotEmpty, IsDate } from 'class-validator';

export class CreateElectionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;
}
