import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as UUID } from 'uuid';
import { isUUID } from 'class-validator';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor(

    @InjectRepository(Product)
    private readonly productRepository : Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository : Repository<ProductImage>,

    private readonly dataSource: DataSource,

  ){}



  async create(createProductDto: CreateProductDto) {

    try {

      // este código se movió a producto.entity a un metodo con el decorador beforeInsert
      // if( !createProductDto.slot){
      //   createProductDto.slot = createProductDto.title
      //   .toLowerCase()
      //   .replaceAll('', '_')
      //   .replaceAll("'",'')
      // } else {
      //   createProductDto.slot = createProductDto.slot
      //   .toLowerCase()
      //   .replaceAll(' ','_')
      //   .replaceAll("'",'')
      // }

      const { images = [], ...productDetails } = createProductDto;

      const product  = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image }))
      });
      await this.productRepository.save(product);

      return {product, images} ;

    } catch (error) {
      //console.log(error);

      this.handleDBExceptions(error);

    }

    
  }

  async findAll(paginationDto: PaginationDto) {

    const {limit = 10, offset= 0} = paginationDto;

    const products =  await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }

    });

    return products.map(product => ({
      ...product,
      images: Array.isArray(product.images) ? product.images.map(img => img.url) : []
    }));
  }

  async findOne(term: string) {

    let product ;

    if ( isUUID(term)){
      product = await this.productRepository.findOneBy({ id : term });
    } else {

      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await  queryBuilder
      .where('UPPER(title) =:title or slot =:slot', {
        title: term.toUpperCase(),
        slot: term.toUpperCase(),
      })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne();
      
    }


    if ( !product ){
      throw new NotFoundException (`Product with term ${term} not found`);
    }

    return product;
  }

  async findOnePlain (term:string) {
    const { images = [], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map( image => image.url )

    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({id, ...toUpdate});

    // const product = await this.productRepository.preload({
    //   id:id,
    //   ...updateProductDto,
    //   images:[],
    // });

    if (!product) throw new NotFoundException(`Product with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if (images){
        await queryRunner.manager.delete( ProductImage, { product: { id }} );
        product.images = images.map ( 
          image => this.productImageRepository.create({ url: image})
        );
      } 

      await queryRunner.manager.save ( product );
      await queryRunner.commitTransaction();
      await queryRunner.release();

      //await this.productRepository.save( product );
      return this.findOnePlain( id );
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }


  }

  async remove(id: string) {

    const product = await this.findOne(id);

    await this.productRepository.remove(product);

  }

  private handleDBExceptions ( error: any ){

    if( error.code === '23505' ){
      throw new BadRequestException(error.detail);

      this.logger.error(error);
      throw new InternalServerErrorException('Unexpected error, check server logs')

    }

  }

  async deleteAllProducts (){
    const query = this.productImageRepository.createQueryBuilder('product');

    try {
      return await query
      .delete()
      .where({})
      .execute();
    } catch (error) {
      
    }
  }
}
