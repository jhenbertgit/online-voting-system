import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class SetCacheDto {
  @IsString()
  @MaxLength(100000) // Increased limit for large cache values
  key: string;

  @IsString()
  @MaxLength(1000000) // Increased limit for large cached data (1MB)
  value: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  ttlSeconds?: number;
}
