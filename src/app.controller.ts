import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { multerOption } from './multer.options';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('file-upload')
  @UseInterceptors(FileInterceptor('file', multerOption))
  fileUpload(@UploadedFile() file: Express.Multer.File){
    // storage의 타입에는 diskStorage()와 memoryStorage()가 있습니다.

    // 아래 소스는 memoryStorage()를 사용하며, 파일속성은 buffer입니다.
    //console.log(file.buffer.toString('utf-8'));

    console.log(file);
    return `${file.originalname} FIle Uploaded check http://localhost:3000/uploads/${file.filename}`;
  }
}
