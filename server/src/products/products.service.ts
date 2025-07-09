import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Product, ProductResponse, StockUpdateRequest } from './interfaces/product.interface';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  // 메모리 저장소 (실제 환경에서는 데이터베이스 사용)
  private products: Map<string, Product> = new Map([
    [
      '123456789',
      {
        id: '123456789',
        name: '테스트 상품 A',
        price: 15000,
        category: '전자제품',
        stock: 50,
        description: '바코드 테스트용 상품입니다.',
        manufacturer: '테스트 회사',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    [
      '987654321',
      {
        id: '987654321',
        name: '테스트 상품 B',
        price: 8500,
        category: '생활용품',
        stock: 30,
        description: '또 다른 테스트 상품입니다.',
        manufacturer: '샘플 제조사',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    [
      'CODE39TEST',
      {
        id: 'CODE39TEST',
        name: 'CODE39 샘플 제품',
        price: 25000,
        category: '샘플',
        stock: 100,
        description: 'CODE39 바코드 테스트 전용 상품',
        manufacturer: '바코드 테스트',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  ]);

  /**
   * 바코드로 제품 조회
   */
  async findByBarcode(barcode: string): Promise<ProductResponse> {
    this.logger.log(`제품 조회: ${barcode}`);

    if (!barcode || barcode.trim() === '') {
      throw new BadRequestException('바코드가 제공되지 않았습니다.');
    }

    const product = this.products.get(barcode);
    if (!product) {
      this.logger.warn(`제품을 찾을 수 없음: ${barcode}`);
      throw new NotFoundException({
        message: '해당 바코드의 제품을 찾을 수 없습니다.',
        barcode,
        availableBarcodes: Array.from(this.products.keys()),
      });
    }

    return this.formatProductResponse(product);
  }

  /**
   * 모든 제품 목록 조회
   */
  async findAll(): Promise<ProductResponse[]> {
    this.logger.log('모든 제품 목록 조회');
    const products = Array.from(this.products.values());
    return products.map((product) => this.formatProductResponse(product));
  }

  /**
   * 재고 업데이트
   */
  async updateStock(
    barcode: string,
    stockUpdate: StockUpdateRequest,
  ): Promise<{
    product: ProductResponse;
    message: string;
  }> {
    this.logger.log(`재고 업데이트: ${barcode}, ${stockUpdate.action}, ${stockUpdate.quantity}`);

    const product = this.products.get(barcode);
    if (!product) {
      throw new NotFoundException('제품을 찾을 수 없습니다.');
    }

    const { action, quantity } = stockUpdate;

    if (quantity <= 0) {
      throw new BadRequestException('수량은 양수여야 합니다.');
    }

    switch (action) {
      case 'increase_stock':
        product.stock += quantity;
        product.updatedAt = new Date();
        this.logger.log(`재고 증가: ${barcode}, ${quantity}개 → 현재 재고: ${product.stock}`);
        return {
          product: this.formatProductResponse(product),
          message: `재고가 ${quantity}개 추가되었습니다.`,
        };

      case 'decrease_stock':
        if (product.stock < quantity) {
          throw new BadRequestException({
            message: '재고가 부족합니다.',
            availableStock: product.stock,
            requestedQuantity: quantity,
          });
        }
        product.stock -= quantity;
        product.updatedAt = new Date();
        this.logger.log(`재고 감소: ${barcode}, ${quantity}개 → 현재 재고: ${product.stock}`);
        return {
          product: this.formatProductResponse(product),
          message: `재고가 ${quantity}개 차감되었습니다.`,
        };

      default:
        throw new BadRequestException('지원하지 않는 액션입니다.');
    }
  }

  /**
   * 제품 응답 포맷팅
   */
  private formatProductResponse(product: Product): ProductResponse {
    return {
      ...product,
      formattedPrice: `${product.price.toLocaleString()}원`,
      scannedAt: new Date().toISOString(),
    };
  }

  /**
   * 개발용 - 제품 추가
   */
  async createProduct(productData: Omit<Product, 'createdAt' | 'updatedAt'>): Promise<ProductResponse> {
    const product: Product = {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.products.set(product.id, product);
    this.logger.log(`새 제품 추가: ${product.id}`);

    return this.formatProductResponse(product);
  }

  /**
   * 개발용 - 제품 삭제
   */
  async deleteProduct(barcode: string): Promise<void> {
    if (!this.products.has(barcode)) {
      throw new NotFoundException('제품을 찾을 수 없습니다.');
    }

    this.products.delete(barcode);
    this.logger.log(`제품 삭제: ${barcode}`);
  }
}
