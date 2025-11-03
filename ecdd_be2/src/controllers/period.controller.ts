// src/controllers/period.controller.ts
import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Period } from '../models/Period';
import { ResponseUtil } from '../utils/response.util';
import { Op } from 'sequelize';

// Redis cache helpers
import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPrefix,
  buildKey,
} from '../utils/cache.util';

export class PeriodController extends BaseController<Period> {
  private entity = 'period';

  constructor() {
    super(Period);
  }

  /**
   * GET /period/active
   * Trả về các period đang isactive = true, có phân trang
   * Cache key: period:active:page=..&limit=..
   */
  async getActive(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const cacheKey = buildKey([
        this.entity,
        'active',
        `page=${page}&limit=${limit}`,
      ]);

      // 1. thử lấy từ cache
      const cached = await cacheGet<any>(cacheKey);
      if (cached) {
        return ResponseUtil.success(res, cached);
      }

      // 2. query DB gốc
      const { count, rows } = await Period.findAndCountAll({
        where: {
          isactive: true,
        },
        limit: Number(limit),
        offset,
        order: [['fromdate', 'DESC']],
      });

      console.log(`Found ${count} active periods`);

      const payload = {
        data: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: count === 0 ? 0 : Math.ceil(count / Number(limit)),
        },
      };

      // 3. lưu cache
      await cacheSet(cacheKey, payload);

      // 4. trả về
      if (rows.length === 0) {
        return ResponseUtil.success(
          res,
          payload,
          'No active periods found'
        );
      }

      return ResponseUtil.success(res, payload);
    } catch (error: any) {
      console.error('Get active periods error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * GET /period/current
   * Tìm period đang active và bao phủ ngày hôm nay.
   * Nếu không có, trả về period active gần nhất.
   * Cache key: period:current
   */
  async getCurrent(req: Request, res: Response) {
    try {
      const cacheKey = buildKey([this.entity, 'current']);

      // 1. cache first
      const cached = await cacheGet<any>(cacheKey);
      if (cached) {
        return ResponseUtil.success(res, cached);
      }

      // 2. DB logic gốc
      const today = new Date();

      // period bao phủ ngày hiện tại
      let period = await Period.findOne({
        where: {
          isactive: true,
          fromdate: { [Op.lte]: today }, // fromdate <= today
          todate: { [Op.gte]: today },   // todate >= today
        },
        order: [['fromdate', 'DESC']],
      });

      if (!period) {
        // Fallback: period active gần nhất
        period = await Period.findOne({
          where: { isactive: true },
          order: [['fromdate', 'DESC']],
        });

        if (!period) {
          const emptyPayload = { data: [] };
          await cacheSet(cacheKey, emptyPayload);
          return ResponseUtil.success(
            res,
            emptyPayload,
            'No current period found'
          );
        }

        const payload = { data: [period] };
        await cacheSet(cacheKey, payload);
        return ResponseUtil.success(res, payload);
      }

      // Có period phù hợp
      const payload = { data: [period] };
      await cacheSet(cacheKey, payload);
      return ResponseUtil.success(res, payload);
    } catch (error: any) {
      console.error('Get current period error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * GET /period
   * Giữ logic ban đầu của bạn:
   * - hỗ trợ filter isactive
   * - phân trang
   * Cache key: period:list:<JSON({page,limit,where})>
   */
  async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, isactive } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (isactive !== undefined) {
        where.isactive = isactive === 'true';
      }

      const cacheKey = buildKey([
        this.entity,
        'list',
        JSON.stringify({ page, limit, where }),
      ]);

      // 1. cache first
      const cached = await cacheGet<any>(cacheKey);
      if (cached) {
        return ResponseUtil.success(res, cached);
      }

      // 2. DB logic gốc
      const { count, rows } = await Period.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['fromdate', 'DESC']],
      });

      const payload = {
        data: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit)),
        },
      };

      // 3. set cache
      await cacheSet(cacheKey, payload);

      return ResponseUtil.success(res, payload);
    } catch (error: any) {
      console.error('Get all periods error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * CREATE /period
   * Logic gốc của bạn giữ nguyên:
   *  - tạo Period
   *  - set createddate / createdby
   * Sau đó xoá cache liên quan.
   */
  async create(req: Request, res: Response) {
    try {
      const { code, name, note, fromdate, todate, isactive } = req.body;

      const period = await Period.create({
        code,
        name,
        note,
        fromdate,
        todate,
        isactive: isactive !== undefined ? isactive : true,
        createddate: new Date(),
        createdby: (req as any).user?.email || 'system',
      });

      await this.invalidateAfterWrite(period.id);

      return ResponseUtil.created(
        res,
        period,
        'Period created successfully'
      );
    } catch (error: any) {
      console.error('Create period error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * UPDATE /period/:id
   * Giữ nguyên logic cập nhật cũ:
   *  - findByPk
   *  - update fields
   * Sau đó xoá cache.
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { code, name, note, fromdate, todate, isactive } = req.body;

      const period = await Period.findByPk(id);
      if (!period) {
        return ResponseUtil.notFound(res, 'Period not found');
      }

      await period.update({
        code,
        name,
        note,
        fromdate,
        todate,
        isactive,
        updateddate: new Date(),
        updatedby: (req as any).user?.email || 'system',
      });

      await this.invalidateAfterWrite(id);

      return ResponseUtil.updated(
        res,
        period,
        'Period updated successfully'
      );
    } catch (error: any) {
      console.error('Update period error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * DELETE /period/:id
   * Giữ nguyên logic xóa cũ:
   *  - findByPk
   *  - destroy
   * Sau đó xoá cache liên quan.
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const period = await Period.findByPk(id);
      if (!period) {
        return ResponseUtil.notFound(res, 'Period not found');
      }

      await period.destroy();

      await this.invalidateAfterWrite(id);

      return ResponseUtil.success(
        res,
        null,
        'Period deleted successfully'
      );
    } catch (error: any) {
      console.error('Delete period error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Xoá cache liên quan sau khi ghi DB
   * period:<id>
   * period:list:...
   * period:active:...
   * period:current
   */
  private async invalidateAfterWrite(id?: string | number) {
    if (id !== undefined) {
      await cacheDel(buildKey([this.entity, id]));
    }

    // clear tất cả list cache
    await cacheDelPrefix(this.entity + ':list');

    // clear các cache active
    await cacheDelPrefix(this.entity + ':active');

    // clear current period cache
    await cacheDel(buildKey([this.entity, 'current']));
  }
}
