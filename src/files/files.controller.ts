import { Controller, Get, Post, Patch, Param, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { fileFilter, fileNamer } from './helpers/';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}


  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName:string
  ){
    const path = this.filesService.getStaticProductImage(imageName);

    // res.status(403).json({
    //   ok:false,
    //   path:path
    // })

    res.sendFile( path );

    //return path;
  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    //limits:{ fileSize: 1000}
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductImage( 
    @UploadedFile() file: Express.Multer.File
  ){
    if ( !file ){
      throw new BadRequestException('Make sure that the file is an image');

    }
    
    const secureUrl = `${ this.configService.get('HOST_API')}/files/product/${ file.filename } `;

    return {secureUrl};
    //  return { 
    //    fileName : file.originalname
    //  };
  }

}
