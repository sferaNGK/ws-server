import { Body, Controller, Post } from '@nestjs/common';

@Controller('result')
export class ResultController {
  @Post()
  async getResult(@Body() body: any) {
    return body;
  }
}
