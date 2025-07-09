import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsService],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProductByBarcode', () => {
    it('should return a product for valid barcode', async () => {
      const barcode = '123456789';
      const result = await controller.getProductByBarcode(barcode);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe(barcode);
    });

    it('should return error for invalid barcode', async () => {
      const barcode = 'INVALID';
      const result = await controller.getProductByBarcode(barcode);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateProductStock', () => {
    it('should increase stock successfully', async () => {
      const barcode = '123456789';
      const stockUpdate = { action: 'increase_stock' as const, quantity: 5 };

      const result = await controller.updateProductStock(barcode, stockUpdate);

      expect(result.success).toBe(true);
      expect(result.message).toContain('추가되었습니다');
    });

    it('should decrease stock successfully', async () => {
      const barcode = '123456789';
      const stockUpdate = { action: 'decrease_stock' as const, quantity: 1 };

      const result = await controller.updateProductStock(barcode, stockUpdate);

      expect(result.success).toBe(true);
      expect(result.message).toContain('차감되었습니다');
    });

    it('should fail with invalid action', async () => {
      const barcode = '123456789';
      const stockUpdate = { action: 'invalid_action' as any, quantity: 1 };

      const result = await controller.updateProductStock(barcode, stockUpdate);

      expect(result.success).toBe(false);
      expect(result.error).toContain('action은');
    });
  });
});
