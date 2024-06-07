import { PartialType } from '@nestjs/mapped-types';
import { CreateDockerDto } from './create-docker.dto';

export class UpdateDockerDto extends PartialType(CreateDockerDto) {}
