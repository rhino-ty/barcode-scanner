import { Controller, Get, Post, Param, Body, HttpStatus, HttpCode, HttpException, Logger } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiResponse, StockUpdateRequest } from './interfaces/product.interface';

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /api/products
   * 모든 제품 목록 조회
   */
  @Get()
  async getAllProducts(): Promise<ApiResponse> {
    try {
      const products = await this.productsService.findAll();
      return {
        success: true,
        data: products,
      };
    } catch (error) {
      this.logger.error('제품 목록 조회 실패', error);
      return {
        success: false,
        error: '제품 목록을 조회할 수 없습니다.',
      };
    }
  }

  /**
   * GET /api/products/:barcode
   * 바코드로 제품 조회
   */
  @Get(':barcode')
  async getProductByBarcode(@Param('barcode') barcode: string): Promise<ApiResponse> {
    try {
      const product = await this.productsService.findByBarcode(barcode);
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      this.logger.error(`제품 조회 실패: ${barcode}`, error);

      if (error instanceof HttpException) {
        const response = error.getResponse();
        return {
          success: false,
          error: typeof response === 'string' ? response : (response as any).message,
          ...(typeof response === 'object' ? response : {}),
        };
      }

      return {
        success: false,
        error: '제품 조회 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * POST /api/products/:barcode
   * 제품 재고 업데이트
   */
  @Post(':barcode')
  @HttpCode(HttpStatus.OK)
  async updateProductStock(
    @Param('barcode') barcode: string,
    @Body() stockUpdate: StockUpdateRequest,
  ): Promise<ApiResponse> {
    try {
      // 요청 데이터 검증
      if (!stockUpdate.action || !stockUpdate.quantity) {
        return {
          success: false,
          error: 'action과 quantity는 필수입니다.',
        };
      }

      if (!['increase_stock', 'decrease_stock'].includes(stockUpdate.action)) {
        return {
          success: false,
          error: 'action은 increase_stock 또는 decrease_stock이어야 합니다.',
        };
      }

      if (typeof stockUpdate.quantity !== 'number' || stockUpdate.quantity <= 0) {
        return {
          success: false,
          error: 'quantity는 양의 정수여야 합니다.',
        };
      }

      const result = await this.productsService.updateStock(barcode, stockUpdate);

      return {
        success: true,
        message: result.message,
        data: result.product,
      };
    } catch (error) {
      this.logger.error(`재고 업데이트 실패: ${barcode}`, error);

      if (error instanceof HttpException) {
        const response = error.getResponse();
        return {
          success: false,
          error: typeof response === 'string' ? response : (response as any).message,
          ...(typeof response === 'object' ? response : {}),
        };
      }

      return {
        success: false,
        error: '재고 업데이트 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * GET /api/products/:barcode/health
   * 특정 제품 상태 확인 (개발용)
   */
  @Get(':barcode/health')
  async checkProductHealth(@Param('barcode') barcode: string): Promise<ApiResponse> {
    try {
      const product = await this.productsService.findByBarcode(barcode);

      let status = 'healthy';
      if (product.stock === 0) {
        status = 'out_of_stock';
      } else if (product.stock < 10) {
        status = 'low_stock';
      }

      return {
        success: true,
        data: {
          barcode: product.id,
          name: product.name,
          stock: product.stock,
          status,
          lastUpdated: product.updatedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: '제품 상태를 확인할 수 없습니다.',
      };
    }
  }
}
