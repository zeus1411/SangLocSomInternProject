// src/controllers/program.controller.ts
import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Program } from '../models/Program';
import { Form } from '../models/Form';
import { ResponseUtil } from '../utils/response.util';

// Redis cache helpers
import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPrefix,
  buildKey,
} from '../utils/cache.util';

export class ProgramController extends BaseController<Program> {
  private entity = 'program';

  constructor() {
    super(Program);
  }

  /**
   * GET /program/:id/forms
   * Lấy 1 Program + danh sách forms liên quan
   * Cache key: program:<id>:forms
   */
  async getWithForms(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cacheKey = buildKey([this.entity, id, 'forms']);

      // 1. cache first
      const cached = await cacheGet<any>(cacheKey);
      if (cached) {
        return ResponseUtil.success(res, cached);
      }

      // 2. DB logic gốc
      const program = await Program.findByPk(id, {
        include: [
          {
            model: Form,
            as: 'forms',
          },
        ],
      });

      if (!program) {
        return ResponseUtil.notFound(res, 'Program not found');
      }

      // 3. save cache
      await cacheSet(cacheKey, program);

      return ResponseUtil.success(res, program);
    } catch (error: any) {
      console.error('Get program with forms error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * GET /program/bycode/:code
   * Lấy Program theo code + forms
   * Cache key: program:code:<code>
   */
  async getByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const cacheKey = buildKey([this.entity, 'code', code]);

      // 1. cache first
      const cached = await cacheGet<any>(cacheKey);
      if (cached) {
        return ResponseUtil.success(res, cached);
      }

      // 2. DB logic gốc
      const program = await Program.findOne({
        where: { code },
        include: [
          {
            model: Form,
            as: 'forms',
          },
        ],
      });

      if (!program) {
        return ResponseUtil.notFound(res, 'Program not found');
      }

      // 3. save cache
      await cacheSet(cacheKey, program);

      return ResponseUtil.success(res, program);
    } catch (error: any) {
      console.error('Get program by code error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Override create/update/delete để clear cache sau khi ghi DB.
   * Ta gọi super.<method>() để chạy logic CRUD gốc của BaseController
   * (bao gồm ResponseUtil.created/updated/deleted),
   * rồi sau đó mình dọn cache tuỳ biến.
   */

  async create(req: Request, res: Response) {
    const result = await super.create(req, res);
    await this.invalidateAfterWrite();
    return result;
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const result = await super.update(req, res);
    await this.invalidateAfterWrite(id);
    return result;
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const result = await super.delete(req, res);
    await this.invalidateAfterWrite(id);
    return result;
  }

  /**
   * Xoá cache liên quan tới Program khi dữ liệu đổi
   * - program:<id>
   * - program:<id>:forms
   * - program:code:<...>
   * - program:list:...
   */
  private async invalidateAfterWrite(id?: string | number) {
    if (id !== undefined) {
      await cacheDel(buildKey([this.entity, id]));
      await cacheDel(buildKey([this.entity, id, 'forms']));
    }

    // clear danh sách
    await cacheDelPrefix(this.entity + ':list');

    // clear cache by code
    await cacheDelPrefix(this.entity + ':code');
  }
}
