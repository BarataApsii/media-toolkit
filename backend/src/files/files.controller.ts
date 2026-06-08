import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const storage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB
          new FileTypeValidator({
            fileType: /^(image\/(jpeg|png|webp|gif|bmp|tiff)|video\/(mp4|avi|mov|mkv|webm))$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Request() req: { user: { id: string } },
  ) {
    return this.filesService.createFileRecord(req.user.id, file);
  }

  @Get(':id')
  async getFile(@Param('id') id: string) {
    return this.filesService.getFileById(id);
  }

  @Get('user/me')
  async getMyFiles(@Request() req: { user: { id: string } }) {
    return this.filesService.getUserFiles(req.user.id);
  }
}
