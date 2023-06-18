# 파일 업로드
웹을 해보신 분이라면 기본적으로 다 할줄 아시는 부분일겁니다.

이를 nestjs에서 하는 방법을 알아 봅시다.

인터셉트란 클라이언트와 핸들러함수 사이에서 로직을 추가하는 미들웨어 입니다.

본 예제에서는 FileIntercepter()를 사용하였습니다.

import
```
# multer는 nest-file-upload에 이미 포함되어 있으니, 타입정보 제공 패키지를 추가합니다.
npm i -D @types/multer

# 정적 파일을 사용하기 위해서 추가합니다.
npm i @nestjs/serve-static
```

function
```
전송된 파일 데이터를 받고, 저장하는 API
localhost:3000/file-upload
```

test
```
파일 업로드하는 정적페이지 호출 URL
localhost:3000/file-static

Rest Client Extensions를 이용한 테스트
src/file-upload.http
```

<br><br>

# 컨트롤러
- console.log(file.buffer.toString('utf-8')); 아래의 이 부분은 파일 저장기능이 없을때, 텍스트 파일은 버퍼에 바이너리 값으로 저장되어 있기에 이를 출력할 때 사용하였습니다.
- FileInterceptor() 의 
  - 첫번째 인자가 file로 되어있는데, 이는 multipart요청에서 파일을 식별하는 필드의 이름입니다.
  - 두번째 인자는 파일데이터의 옵션으로, storage 설정 등이 가능합니다.
```
app.controller.ts

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
    // console.log(file.buffer.toString('utf-8'));

    console.log(file);
    return `${file.originalname} FIle Uploaded check http://localhost:3000/uploads/${file.filename}`;
  }
}
```

<br>

- 위 소스에서 multerOption 매개변수를 구현체 입니다.
- 만약 multerOption이 설정하지 않을경우엔 memoryStroage()가 default인데, 이는 메모리를 기본값으로 쓰며, 파일 속성은 buffer 이기 떄문에 상단의 file.buffer를 이용하여 읽어 왔습니다.
- 아래의 소스에서는 storage를 distStorage를 사용하였으니, 이는 디스크에 저장합니다.
  - destination은 파일을 저장할 경로를 의미합니다.
  - filename은 저장할 파일의 이름 입니다. 여기서는 UUID를 이용해서 고유네이밍을 지어주고, extname을 이용해서 확장자를 붙여주었습니다.
```
multer.option.ts.

import { randomUUID } from "crypto";
import { diskStorage } from "multer";
import { extname, join } from "path";

export const multerOption = {
    storage: diskStorage({
        destination: join(__dirname, '..', 'uploads'),
        filename: (req, file, cb) => {
            cb(null, randomUUID() + extname(file.originalname));
        }
    })
}
```

<br><br>

# 정적파일 서비스하기
@nestjs/serve-static 패키지를 이용하며, 모듈 import에 추가해줍니다.
- rootPath : 정적파일의 저장 경로를 설정 해줍니다.
- serveRoot : 정적파일에 접근할때 default 경로를 설정해줌으로써, 경로 중복을 방지합니다.
```
app.module.ts

import { ServeStaticModule } from '@nestjs/serve-static';

ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'uploads'),
  serveRoot: '/uploads',
}),
```

<br><br>

# HTML 폼으로 업로드하기
html form으로 파일 업로드는 기본이라고 생각하시겠지만, nest에서 html파일을 다루어 볼겁니다.

html을 사용하려면 웹 프레임워크에 설정해야합니다. 본 예제는 nest이니 이에 맞게 설정합니다.

```
main.ts

import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.useStaticAssets(join(__dirname, '..', 'static'));
```

<br><br><br><br><br><br>
출처 - Node.js 백엔드 개발자 되기 (저자 : 박승규)