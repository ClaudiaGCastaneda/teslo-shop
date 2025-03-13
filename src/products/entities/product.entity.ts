import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToMany } from "typeorm";
import { ProductImage } from "./product-image.entity";

@Entity({ name:'products'})
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column('text', {
        unique:true,
    })
    title: string;

    @Column('float', {
        default:0
    })
    price:number

    @Column({
        type:'text',
        nullable:true
    })
    description: string;

    @Column('text', {
        unique:true
    })
    slot:string;

    @Column('int',{
        default:0
    })
    stock:number;

    @Column('text', {
        array:true
    })
    sizes: string[];

    @Column('text')
    gender:string;

    @Column('text', {
        array: true,
        default:[]
    })
    tags: string[]

    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[]

    @BeforeInsert()
    checkSlotInsert(){

        if( !this.slot){
            this.slot = this.title;

        }

        this.slot = this.slot
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll("'",'')
    }


    @BeforeUpdate()
    checkSlotUpdate(){

        this.slot = this.slot
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll("'",'')
    }

}
